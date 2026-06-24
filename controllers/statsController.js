import dotenv from 'dotenv';
import Project from '../models/Project.js';
import SiteProfile from '../models/SiteProfile.js';

dotenv.config();

const DEFAULT_GITHUB_USERNAME = 'vijaydinodia';
const DEFAULT_LEETCODE_USERNAME = 'vijaydinodia';
const CACHE_TTL = 10 * 60 * 1000;

const cache = {
  github: new Map(),
  leetcode: new Map(),
};

const getCached = (source, key) => {
  const cached = cache[source].get(key);
  if (!cached || Date.now() - cached.fetchedAt > CACHE_TTL) {
    return null;
  }

  return cached.data;
};

const setCached = (source, key, data) => {
  cache[source].set(key, { data, fetchedAt: Date.now() });
};

const extractUsername = (value, service) => {
  if (!value) return null;

  const rawValue = String(value).trim();
  if (!rawValue) return null;

  const fallback = rawValue.replace(/^@/, '').split(/[/?#]/)[0];

  try {
    const normalizedUrl = rawValue.startsWith('http') ? rawValue : `https://${rawValue}`;
    const url = new URL(normalizedUrl);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);

    if (service === 'github' && host === 'github.com') {
      return parts[0] || null;
    }

    if (service === 'leetcode' && host === 'leetcode.com') {
      return parts[0] === 'u' ? parts[1] || null : parts[0] || null;
    }
  } catch {
    return fallback || null;
  }

  return fallback || null;
};

const resolveUsernames = (profile) => ({
  githubUsername:
    process.env.GITHUB_USERNAME ||
    extractUsername(profile?.github, 'github') ||
    DEFAULT_GITHUB_USERNAME,
  leetcodeUsername:
    process.env.LEETCODE_USERNAME ||
    extractUsername(profile?.leetcode, 'leetcode') ||
    DEFAULT_LEETCODE_USERNAME,
});

const fetchGitHub = async (username) => {
  const cached = getCached('github', username);
  if (cached) return cached;

  const headers = {
    Accept: 'application/vnd.github+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`GitHub request failed with ${res.status}`);
  }

  const json = await res.json();
  const data = {
    username,
    publicRepos: json.public_repos ?? null,
    followers: json.followers ?? null,
    following: json.following ?? null,
    profileUrl: json.html_url || `https://github.com/${username}`,
    avatarUrl: json.avatar_url || '',
  };

  setCached('github', username, data);
  return data;
};

const fetchLeetCode = async (username) => {
  const cached = getCached('leetcode', username);
  if (cached) return cached;

  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        profile {
          ranking
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ query, variables: { username } }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`LeetCode request failed with ${res.status}`);
  }

  const resJson = await res.json();
  const matchedUser = resJson?.data?.matchedUser;

  if (!matchedUser) {
    throw new Error(`LeetCode user not found: ${username}`);
  }

  const acStats = matchedUser.submitStats?.acSubmissionNum || [];
  const byDifficulty = Object.fromEntries(
    acStats.map((item) => [item.difficulty.toLowerCase(), item.count])
  );

  const data = {
    username,
    totalSolved: byDifficulty.all ?? 0,
    easySolved: byDifficulty.easy ?? 0,
    mediumSolved: byDifficulty.medium ?? 0,
    hardSolved: byDifficulty.hard ?? 0,
    ranking: matchedUser.profile?.ranking ?? null,
    profileUrl: `https://leetcode.com/u/${username}/`,
  };

  setCached('leetcode', username, data);
  return data;
};

export const getStats = async (req, res) => {
  try {
    const profile = await SiteProfile.findOne();
    const { githubUsername, leetcodeUsername } = resolveUsernames(profile);

    const [github, leetcode, projectCount] = await Promise.allSettled([
      fetchGitHub(githubUsername),
      fetchLeetCode(leetcodeUsername),
      Project.countDocuments({ isDeleted: false }),
    ]);

    const githubData = github.status === 'fulfilled' ? github.value : null;
    const leetcodeData = leetcode.status === 'fulfilled' ? leetcode.value : null;

    res.json({
      success: true,
      data: {
        githubRepos: githubData?.publicRepos ?? null,
        leetcodeSolved: leetcodeData?.totalSolved ?? null,
        projectsBuilt: projectCount.status === 'fulfilled' ? projectCount.value : 0,
        github: githubData || {
          username: githubUsername,
          profileUrl: `https://github.com/${githubUsername}`,
          error: github.reason?.message || 'GitHub stats unavailable',
        },
        leetcode: leetcodeData || {
          username: leetcodeUsername,
          profileUrl: `https://leetcode.com/u/${leetcodeUsername}/`,
          error: leetcode.reason?.message || 'LeetCode stats unavailable',
        },
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
