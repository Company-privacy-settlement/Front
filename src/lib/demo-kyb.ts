// Explicit build-time switch for the hackathon deployment. Default builds use
// the regular provider/intake flow; this never establishes verified identity.
export const hackathonKybEnabled=process.env.NEXT_PUBLIC_MONEY_STATION_DEMO_KYB==='1';
