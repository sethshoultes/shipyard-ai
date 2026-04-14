/**
 * RANK — Metro Area Configuration
 *
 * Maps cities to their Metropolitan Statistical Areas (MSAs) for cohort fallback.
 * Per decisions.md: "city -> metro -> state. If state N < 10, show 'Insufficient data'"
 *
 * Metro areas are defined by the US Census Bureau as Core-Based Statistical Areas (CBSAs).
 * This mapping enables cohort expansion when city-level data is insufficient (N < 10).
 *
 * Requirements:
 *   REQ-BL-002: Dynamic Cohort Sizing
 */

/**
 * Mapping of cities to their primary metro area names.
 * Format: "City, ST" -> "Metro Area Name"
 *
 * Note: This is a representative subset covering major US metros.
 * Cities not in this mapping will return null for metro, falling back to state-level cohort.
 */
const CITY_TO_METRO: Record<string, string> = {
  // Texas metros
  "Austin, TX": "Austin-Round Rock-Georgetown",
  "Round Rock, TX": "Austin-Round Rock-Georgetown",
  "Georgetown, TX": "Austin-Round Rock-Georgetown",
  "Cedar Park, TX": "Austin-Round Rock-Georgetown",
  "Pflugerville, TX": "Austin-Round Rock-Georgetown",
  "San Marcos, TX": "Austin-Round Rock-Georgetown",
  "Kyle, TX": "Austin-Round Rock-Georgetown",
  "Leander, TX": "Austin-Round Rock-Georgetown",
  "Houston, TX": "Houston-The Woodlands-Sugar Land",
  "The Woodlands, TX": "Houston-The Woodlands-Sugar Land",
  "Sugar Land, TX": "Houston-The Woodlands-Sugar Land",
  "Katy, TX": "Houston-The Woodlands-Sugar Land",
  "Pearland, TX": "Houston-The Woodlands-Sugar Land",
  "Pasadena, TX": "Houston-The Woodlands-Sugar Land",
  "Baytown, TX": "Houston-The Woodlands-Sugar Land",
  "Conroe, TX": "Houston-The Woodlands-Sugar Land",
  "Dallas, TX": "Dallas-Fort Worth-Arlington",
  "Fort Worth, TX": "Dallas-Fort Worth-Arlington",
  "Arlington, TX": "Dallas-Fort Worth-Arlington",
  "Plano, TX": "Dallas-Fort Worth-Arlington",
  "Irving, TX": "Dallas-Fort Worth-Arlington",
  "Frisco, TX": "Dallas-Fort Worth-Arlington",
  "McKinney, TX": "Dallas-Fort Worth-Arlington",
  "Denton, TX": "Dallas-Fort Worth-Arlington",
  "Richardson, TX": "Dallas-Fort Worth-Arlington",
  "Carrollton, TX": "Dallas-Fort Worth-Arlington",
  "Garland, TX": "Dallas-Fort Worth-Arlington",
  "Grand Prairie, TX": "Dallas-Fort Worth-Arlington",
  "San Antonio, TX": "San Antonio-New Braunfels",
  "New Braunfels, TX": "San Antonio-New Braunfels",

  // California metros
  "Los Angeles, CA": "Los Angeles-Long Beach-Anaheim",
  "Long Beach, CA": "Los Angeles-Long Beach-Anaheim",
  "Anaheim, CA": "Los Angeles-Long Beach-Anaheim",
  "Santa Ana, CA": "Los Angeles-Long Beach-Anaheim",
  "Irvine, CA": "Los Angeles-Long Beach-Anaheim",
  "Glendale, CA": "Los Angeles-Long Beach-Anaheim",
  "Pasadena, CA": "Los Angeles-Long Beach-Anaheim",
  "Torrance, CA": "Los Angeles-Long Beach-Anaheim",
  "Pomona, CA": "Los Angeles-Long Beach-Anaheim",
  "San Francisco, CA": "San Francisco-Oakland-Berkeley",
  "Oakland, CA": "San Francisco-Oakland-Berkeley",
  "Berkeley, CA": "San Francisco-Oakland-Berkeley",
  "Fremont, CA": "San Francisco-Oakland-Berkeley",
  "San Jose, CA": "San Jose-Sunnyvale-Santa Clara",
  "Sunnyvale, CA": "San Jose-Sunnyvale-Santa Clara",
  "Santa Clara, CA": "San Jose-Sunnyvale-Santa Clara",
  "Mountain View, CA": "San Jose-Sunnyvale-Santa Clara",
  "Palo Alto, CA": "San Jose-Sunnyvale-Santa Clara",
  "San Diego, CA": "San Diego-Chula Vista-Carlsbad",
  "Chula Vista, CA": "San Diego-Chula Vista-Carlsbad",
  "Carlsbad, CA": "San Diego-Chula Vista-Carlsbad",
  "Sacramento, CA": "Sacramento-Roseville-Folsom",
  "Roseville, CA": "Sacramento-Roseville-Folsom",
  "Folsom, CA": "Sacramento-Roseville-Folsom",

  // New York metros
  "New York, NY": "New York-Newark-Jersey City",
  "Newark, NJ": "New York-Newark-Jersey City",
  "Jersey City, NJ": "New York-Newark-Jersey City",
  "Yonkers, NY": "New York-Newark-Jersey City",
  "White Plains, NY": "New York-Newark-Jersey City",
  "Stamford, CT": "New York-Newark-Jersey City",

  // Florida metros
  "Miami, FL": "Miami-Fort Lauderdale-Pompano Beach",
  "Fort Lauderdale, FL": "Miami-Fort Lauderdale-Pompano Beach",
  "Pompano Beach, FL": "Miami-Fort Lauderdale-Pompano Beach",
  "Hollywood, FL": "Miami-Fort Lauderdale-Pompano Beach",
  "Hialeah, FL": "Miami-Fort Lauderdale-Pompano Beach",
  "Coral Springs, FL": "Miami-Fort Lauderdale-Pompano Beach",
  "Tampa, FL": "Tampa-St. Petersburg-Clearwater",
  "St. Petersburg, FL": "Tampa-St. Petersburg-Clearwater",
  "Clearwater, FL": "Tampa-St. Petersburg-Clearwater",
  "Orlando, FL": "Orlando-Kissimmee-Sanford",
  "Kissimmee, FL": "Orlando-Kissimmee-Sanford",
  "Sanford, FL": "Orlando-Kissimmee-Sanford",
  "Jacksonville, FL": "Jacksonville",

  // Illinois metros
  "Chicago, IL": "Chicago-Naperville-Elgin",
  "Naperville, IL": "Chicago-Naperville-Elgin",
  "Aurora, IL": "Chicago-Naperville-Elgin",
  "Joliet, IL": "Chicago-Naperville-Elgin",
  "Elgin, IL": "Chicago-Naperville-Elgin",
  "Evanston, IL": "Chicago-Naperville-Elgin",
  "Schaumburg, IL": "Chicago-Naperville-Elgin",

  // Arizona metros
  "Phoenix, AZ": "Phoenix-Mesa-Chandler",
  "Mesa, AZ": "Phoenix-Mesa-Chandler",
  "Chandler, AZ": "Phoenix-Mesa-Chandler",
  "Scottsdale, AZ": "Phoenix-Mesa-Chandler",
  "Gilbert, AZ": "Phoenix-Mesa-Chandler",
  "Glendale, AZ": "Phoenix-Mesa-Chandler",
  "Tempe, AZ": "Phoenix-Mesa-Chandler",
  "Tucson, AZ": "Tucson",

  // Pennsylvania metros
  "Philadelphia, PA": "Philadelphia-Camden-Wilmington",
  "Camden, NJ": "Philadelphia-Camden-Wilmington",
  "Wilmington, DE": "Philadelphia-Camden-Wilmington",
  "Pittsburgh, PA": "Pittsburgh",

  // Georgia metros
  "Atlanta, GA": "Atlanta-Sandy Springs-Alpharetta",
  "Sandy Springs, GA": "Atlanta-Sandy Springs-Alpharetta",
  "Alpharetta, GA": "Atlanta-Sandy Springs-Alpharetta",
  "Marietta, GA": "Atlanta-Sandy Springs-Alpharetta",
  "Roswell, GA": "Atlanta-Sandy Springs-Alpharetta",

  // Washington metros
  "Seattle, WA": "Seattle-Tacoma-Bellevue",
  "Tacoma, WA": "Seattle-Tacoma-Bellevue",
  "Bellevue, WA": "Seattle-Tacoma-Bellevue",
  "Redmond, WA": "Seattle-Tacoma-Bellevue",
  "Kirkland, WA": "Seattle-Tacoma-Bellevue",

  // Massachusetts metros
  "Boston, MA": "Boston-Cambridge-Newton",
  "Cambridge, MA": "Boston-Cambridge-Newton",
  "Newton, MA": "Boston-Cambridge-Newton",
  "Worcester, MA": "Worcester",

  // Colorado metros
  "Denver, CO": "Denver-Aurora-Lakewood",
  "Aurora, CO": "Denver-Aurora-Lakewood",
  "Lakewood, CO": "Denver-Aurora-Lakewood",
  "Boulder, CO": "Boulder",
  "Colorado Springs, CO": "Colorado Springs",

  // Michigan metros
  "Detroit, MI": "Detroit-Warren-Dearborn",
  "Warren, MI": "Detroit-Warren-Dearborn",
  "Dearborn, MI": "Detroit-Warren-Dearborn",
  "Grand Rapids, MI": "Grand Rapids-Kentwood",

  // Minnesota metros
  "Minneapolis, MN": "Minneapolis-St. Paul-Bloomington",
  "St. Paul, MN": "Minneapolis-St. Paul-Bloomington",
  "Bloomington, MN": "Minneapolis-St. Paul-Bloomington",

  // Maryland metros
  "Baltimore, MD": "Baltimore-Columbia-Towson",
  "Columbia, MD": "Baltimore-Columbia-Towson",

  // District of Columbia metros
  "Washington, DC": "Washington-Arlington-Alexandria",
  "Arlington, VA": "Washington-Arlington-Alexandria",
  "Alexandria, VA": "Washington-Arlington-Alexandria",
  "Bethesda, MD": "Washington-Arlington-Alexandria",
  "Silver Spring, MD": "Washington-Arlington-Alexandria",

  // North Carolina metros
  "Charlotte, NC": "Charlotte-Concord-Gastonia",
  "Concord, NC": "Charlotte-Concord-Gastonia",
  "Raleigh, NC": "Raleigh-Cary",
  "Cary, NC": "Raleigh-Cary",
  "Durham, NC": "Durham-Chapel Hill",
  "Chapel Hill, NC": "Durham-Chapel Hill",

  // Ohio metros
  "Columbus, OH": "Columbus",
  "Cleveland, OH": "Cleveland-Elyria",
  "Cincinnati, OH": "Cincinnati",

  // Oregon metros
  "Portland, OR": "Portland-Vancouver-Hillsboro",
  "Vancouver, WA": "Portland-Vancouver-Hillsboro",
  "Hillsboro, OR": "Portland-Vancouver-Hillsboro",

  // Tennessee metros
  "Nashville, TN": "Nashville-Davidson-Murfreesboro-Franklin",
  "Memphis, TN": "Memphis",

  // Missouri metros
  "St. Louis, MO": "St. Louis",
  "Kansas City, MO": "Kansas City",
  "Kansas City, KS": "Kansas City",

  // Nevada metros
  "Las Vegas, NV": "Las Vegas-Henderson-Paradise",
  "Henderson, NV": "Las Vegas-Henderson-Paradise",

  // Indiana metros
  "Indianapolis, IN": "Indianapolis-Carmel-Anderson",

  // Wisconsin metros
  "Milwaukee, WI": "Milwaukee-Waukesha",
  "Madison, WI": "Madison",

  // Utah metros
  "Salt Lake City, UT": "Salt Lake City",
  "Provo, UT": "Provo-Orem",
  "Orem, UT": "Provo-Orem",
} as const;

/**
 * Derives the metro area from a city and state.
 *
 * @param city - City name (e.g., "Austin")
 * @param state - State abbreviation (e.g., "TX")
 * @returns Metro area name, or null if not in a mapped metro area
 *
 * @example
 * ```ts
 * deriveMetroFromCity("Austin", "TX")
 * // "Austin-Round Rock-Georgetown"
 *
 * deriveMetroFromCity("Smalltown", "TX")
 * // null (falls back to state-level cohort)
 * ```
 */
export function deriveMetroFromCity(
  city: string,
  state: string
): string | null {
  const key = `${city}, ${state}`;
  return CITY_TO_METRO[key] ?? null;
}

/**
 * Gets all cities in a given metro area.
 * Useful for cohort queries at the metro level.
 *
 * @param metro - Metro area name
 * @returns Array of "City, ST" strings in that metro
 */
export function getCitiesInMetro(metro: string): string[] {
  return Object.entries(CITY_TO_METRO)
    .filter(([_, m]) => m === metro)
    .map(([city]) => city);
}

/**
 * Gets all unique metro area names.
 */
export function getAllMetros(): string[] {
  return [...new Set(Object.values(CITY_TO_METRO))];
}
