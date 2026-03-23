import axios from 'axios';
import yaml from 'js-yaml';
import type { Legislator } from '../types.js';

const DEFAULT_URL =
  'https://raw.githubusercontent.com/unitedstates/congress-legislators/refs/heads/main/legislators-current.yaml';

export async function fetchLegislators(url = DEFAULT_URL): Promise<Legislator[]> {
  const res = await axios.get(url);
  const parsed = yaml.load(res.data) as any[];
  return parsed.map(mapLegislator);
}

interface Term {
  type: 'rep' | 'sen';
  start: string;
  end: string;
  state: string;
  district?: number;
}

function mapLegislator(raw: any): Legislator {
  const currentTerm = findCurrentTerm(raw.terms);

  return {
    bioguideId: raw.id.bioguide,
    firstName: raw.name.first,
    lastName: raw.name.last,
    title: currentTerm.type === 'sen' ? 'Sen' : 'Rep',
    chamber: currentTerm.type === 'sen' ? 'senate' : 'house',
    district: currentTerm.type === 'rep' ? currentTerm.district ?? null : null,
    state: currentTerm.state,
  };
}

function findCurrentTerm(terms: Term[]): Term {
  const now = Date.now();
  const current = terms.find((t) => new Date(t.end).getTime() > now);
  if (!current) throw new Error('Unable to find current term for legislator');
  return current;
}
