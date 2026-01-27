const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
  verified_addresses: {
    eth_addresses: string[];
  };
}

interface CastReaction {
  reactor: NeynarUser;
  reaction_type: 'like' | 'recast';
}

// Get user by FID
export async function getUserByFid(fid: number): Promise<NeynarUser | null> {
  try {
    const response = await fetch(`${NEYNAR_BASE_URL}/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'api_key': NEYNAR_API_KEY,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.users?.[0] || null;
  } catch (error) {
    console.error('Error fetching user by FID:', error);
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<NeynarUser | null> {
  try {
    const response = await fetch(`${NEYNAR_BASE_URL}/farcaster/user/by_username?username=${username}`, {
      headers: {
        'api_key': NEYNAR_API_KEY,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

// Get cast by URL or hash
export async function getCast(identifier: string) {
  try {
    // Determine if it's a URL or hash
    const isUrl = identifier.startsWith('http');
    const endpoint = isUrl
      ? `${NEYNAR_BASE_URL}/farcaster/cast?identifier=${encodeURIComponent(identifier)}&type=url`
      : `${NEYNAR_BASE_URL}/farcaster/cast?identifier=${identifier}&type=hash`;

    const response = await fetch(endpoint, {
      headers: {
        'api_key': NEYNAR_API_KEY,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.cast || null;
  } catch (error) {
    console.error('Error fetching cast:', error);
    return null;
  }
}

// Get reactions (likes and recasts) for a cast
export async function getCastReactions(castHash: string, type: 'likes' | 'recasts' = 'likes', limit = 100) {
  try {
    const reactions: CastReaction[] = [];
    let cursor: string | null = null;

    do {
      const url = new URL(`${NEYNAR_BASE_URL}/farcaster/reactions/cast`);
      url.searchParams.set('hash', castHash);
      url.searchParams.set('types', type === 'likes' ? 'likes' : 'recasts');
      url.searchParams.set('limit', Math.min(limit - reactions.length, 100).toString());
      if (cursor) url.searchParams.set('cursor', cursor);

      const response = await fetch(url.toString(), {
        headers: {
          'api_key': NEYNAR_API_KEY,
        },
      });

      if (!response.ok) break;

      const data = await response.json();
      reactions.push(...(data.reactions || []));
      cursor = data.next?.cursor || null;
    } while (cursor && reactions.length < limit);

    return reactions;
  } catch (error) {
    console.error('Error fetching cast reactions:', error);
    return [];
  }
}

// Get all participants from a cast (likes + recasts)
export async function getParticipantsFromCast(castIdentifier: string) {
  const cast = await getCast(castIdentifier);
  if (!cast) return [];

  const [likes, recasts] = await Promise.all([
    getCastReactions(cast.hash, 'likes'),
    getCastReactions(cast.hash, 'recasts'),
  ]);

  // Combine and deduplicate by FID
  const participantMap = new Map<number, {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl?: string;
    address?: string;
    hasLiked: boolean;
    hasRecast: boolean;
  }>();

  for (const reaction of likes) {
    participantMap.set(reaction.reactor.fid, {
      fid: reaction.reactor.fid,
      username: reaction.reactor.username,
      displayName: reaction.reactor.display_name,
      pfpUrl: reaction.reactor.pfp_url,
      address: reaction.reactor.verified_addresses?.eth_addresses?.[0],
      hasLiked: true,
      hasRecast: false,
    });
  }

  for (const reaction of recasts) {
    const existing = participantMap.get(reaction.reactor.fid);
    if (existing) {
      existing.hasRecast = true;
    } else {
      participantMap.set(reaction.reactor.fid, {
        fid: reaction.reactor.fid,
        username: reaction.reactor.username,
        displayName: reaction.reactor.display_name,
        pfpUrl: reaction.reactor.pfp_url,
        address: reaction.reactor.verified_addresses?.eth_addresses?.[0],
        hasLiked: false,
        hasRecast: true,
      });
    }
  }

  return Array.from(participantMap.values());
}
