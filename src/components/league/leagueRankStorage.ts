const KEY_PREFIX = 'league_rank_seen_v1';

export const leagueRankSeenKey = (profileId: string, week: number) => `${KEY_PREFIX}:${profileId}:${week}`;
