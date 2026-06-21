// Uses native fetch (Node.js 18+) — no external dependency needed
import Project from '../models/Project.js';
import SiteProfile from '../models/SiteProfile.js';

const LEETCODE_USERNAME = 'vijaydinodia';
const GITHUB_USERNAME = 'vijaydinodia';

// Cache to avoid hammering external APIs
let cache = {
  github: { data: null, fetchedAt: 0 },
  leetcode: { data: null, fetchedAt: 0 },
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const fetchGitHub = async () => {
  const now = Date.now();
  if (cache.github.data && now - cache.github.fetchedAt < CACHE_TTL) {
    return cache.github.data;
  }
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
    headers: { 'Accept': 'application/vnd.github+json' },
    signal: AbortSignal.timeout(8000),
  });
  const json = await res.json();
  const data = { public_repos: json.public_repos };
  cache.github = { data, fetchedAt: now };
  return data;
};

const fetchLeetCode = async () => {
  const now = Date.now();
  if (cache.leetcode.data && now - cache.leetcode.fetchedAt < CACHE_TTL) {
    return cache.leetcode.data;
  }

  // LeetCode public GraphQL API
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
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
      'Referer': 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ query, variables: { username: LEETCODE_USERNAME } }),
    signal: AbortSignal.timeout(8000),
  });
  const resJson = await res.json();

  const acStats = resJson?.data?.matchedUser?.submitStats?.acSubmissionNum || [];
  const allEntry = acStats.find(s => s.difficulty === 'All');
  const totalSolved = allEntry ? allEntry.count : 0;

  const data = { totalSolved };
  cache.leetcode = { data, fetchedAt: now };
  return data;
};

export const getStats = async (req, res) => {
  try {
    const [github, leetcode, projectCount, profile] = await Promise.allSettled([
      fetchGitHub(),
      fetchLeetCode(),
      Project.countDocuments({ isDeleted: false }),
      SiteProfile.findOne(),
    ]);

    const githubRepos = github.status === 'fulfilled' ? github.value.public_repos : 30;
    const leetcodeSolved = leetcode.status === 'fulfilled' ? leetcode.value.totalSolved : 250;
    const projectsBuilt = projectCount.status === 'fulfilled' ? projectCount.value : 10;
    const studentsMentored = (profile.status === 'fulfilled' && profile.value?.studentsMentored)
      ? profile.value.studentsMentored
      : 50;

    res.json({
      success: true,
      data: {
        githubRepos,
        leetcodeSolved,
        projectsBuilt,
        studentsMentored,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
