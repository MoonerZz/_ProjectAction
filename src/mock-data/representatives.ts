import type { Representative } from "@/types";
export const representative: Representative = {
  id: "demo-mp",
  name: "Alex Morgan",
  party: "Example Civic Group (fictional)",
  constituency: "Mereford & West Vale (fictional)",
  roles: [
    "Member of Parliament (demonstration)",
    "Transport Committee (demonstration)",
  ],
  participation: { recorded: 142, total: 156 },
  votes: [
    {
      title: "Public transport accessibility",
      date: "2026-09-18",
      position: "For",
    },
    {
      title: "Local services funding",
      date: "2026-09-16",
      position: "Against",
    },
    {
      title: "Consumer information standards",
      date: "2026-09-14",
      position: "No recorded vote",
    },
  ],
  costs: {
    staffing: 164200,
    office: 24800,
    travel: 6420,
    accommodation: 18360,
  },
  interests: [
    "Illustrative book royalties: £1,000–£5,000",
    "Illustrative unpaid community trustee role",
  ],
};
