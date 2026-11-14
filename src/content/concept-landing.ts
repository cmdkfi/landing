// Typography is scoped to /1; the homepage copy and identifiers stay untouched.
import * as source from './landing';
import { readableCopy } from '../utils/typography';
export const concept = readableCopy(source.concept);
export const incidentStory = readableCopy(source.incidentStory);
export const market = readableCopy(source.market);
export const venue = readableCopy(source.venue);
export const visual = readableCopy(source.visual);
export const cta = readableCopy(source.cta);
export const featuresOf: typeof source.featuresOf = (...args) => readableCopy(source.featuresOf(...args));
export { links, meta, statusLabel } from './landing';
