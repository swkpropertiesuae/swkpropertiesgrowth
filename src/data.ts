export type Task = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  due: string;
  priority: string;
  project: string;
  done: boolean;
};
export type RecordItem = {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  client: string;
  type: string;
  budget: number;
  start: string;
  due: string;
};
export type Proposal = {
  id: string;
  agent: string;
  tier: number;
  content: string;
  status: string;
  created: string;
  reviewer?: string;
};
export type Audit = { id: string; message: string; time: string };
export const roles = [
  "Owner",
  "Sales",
  "Operations Director",
  "BDM",
  "IT Admin",
];
export const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Review property launch creative",
    description:
      "Check image permissions, claims and disclosure before release.",
    assignee: "Demo strategist",
    due: "2026-10-27",
    priority: "High",
    project: "Property launch",
    done: false,
  },
  {
    id: "t2",
    title: "Check enquiry form consent",
    description: "Confirm that contact consent is explicit.",
    assignee: "Demo operations",
    due: "2026-10-28",
    priority: "Medium",
    project: "Website refresh",
    done: false,
  },
  {
    id: "t3",
    title: "Prepare campaign brief",
    description: "Internal draft approved for planning.",
    assignee: "Demo strategist",
    due: "2026-10-24",
    priority: "Low",
    project: "Brand positioning",
    done: true,
  },
];
export const campaigns: RecordItem[] = [
  {
    id: "c1",
    name: "Social Media Campaign",
    description:
      "A considered introduction to the partner portfolio. Internal planning example.",
    status: "Active",
    progress: 85,
    client: "Demo agency",
    type: "Social",
    budget: 5000,
    start: "2026-10-01",
    due: "2026-11-01",
  },
  {
    id: "c2",
    name: "Property Launch Campaign",
    description:
      "Build an image-led launch journey with source checks and consent.",
    status: "Active",
    progress: 60,
    client: "Demo developer",
    type: "Property launch",
    budget: 12000,
    start: "2026-10-05",
    due: "2026-11-15",
  },
  {
    id: "c3",
    name: "Lead Generation Campaign",
    description: "Test voluntary enquiry journeys. Targets are not guarantees.",
    status: "Paused",
    progress: 40,
    client: "Demo agency",
    type: "Enquiries",
    budget: 3500,
    start: "2026-10-10",
    due: "2026-11-20",
  },
];
export const projects: RecordItem[] = [
  {
    ...campaigns[0],
    id: "p1",
    name: "Website refresh",
    progress: 72,
    type: "High",
    description:
      "A more useful property browsing experience, built around mobile enquiries.",
  },
  {
    ...campaigns[1],
    id: "p2",
    name: "Property launch",
    progress: 60,
    type: "High",
  },
  {
    ...campaigns[2],
    id: "p3",
    name: "Brand positioning",
    progress: 40,
    type: "Medium",
  },
];
export const clients: RecordItem[] = [
  {
    ...campaigns[0],
    id: "cl1",
    name: "Demo agency",
    status: "Active",
    type: "Referral",
    description:
      "Fictional business for exploring the workflow. No real client information.",
  },
  {
    ...campaigns[1],
    id: "cl2",
    name: "Demo developer",
    status: "Onboarding",
    type: "Website form",
    description:
      "Fictional developer profile. No personal contact information stored.",
  },
];
export const leads: RecordItem[] = [
  {
    ...campaigns[0],
    id: "l1",
    name: "Sample business enquiry",
    status: "Qualifying",
    type: "Website form",
    description: "Synthetic enquiry. Next follow-up: review requirements.",
    client: "Demo agency",
  },
  {
    ...campaigns[1],
    id: "l2",
    name: "Sample referral",
    status: "Proposal",
    type: "Referral",
    description:
      "Synthetic referral. Next follow-up: prepare a scoped proposal.",
    client: "Demo developer",
  },
];
export const agents = [
  [
    "Market Scout",
    1,
    "Frame a demand research question and identify evidence to collect.",
  ],
  [
    "Truth Guardian",
    0,
    "Check claims for source, date, and verification status.",
  ],
  ["Creative Director", 1, "Outline a campaign concept for human review."],
  ["Content Writer", 0, "Draft concise, source-conscious property messaging."],
  ["Market Analyst", 2, "List assumptions for a comparison of markets."],
  [
    "Compliance Officer",
    0,
    "Draft a permit, consent, and disclosure checklist.",
  ],
  ["Revenue Analyst", 2, "Prepare an illustrative cash-flow scenario."],
  ["Lead Concierge", 1, "Draft a voluntary follow-up sequence."],
  ["Market Timer", 1, "Prepare a monitoring plan without timing promises."],
  ["Portfolio Manager", 2, "Outline a portfolio review framework."],
  ["Legal Review", 2, "Flag questions for a qualified legal adviser."],
  ["Approvals Orchestrator", 0, "Explain the human approval workflow."],
] as const;
export const cities = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "London",
  "Paris",
  "Berlin",
  "Madrid",
  "Rome",
  "Amsterdam",
  "Dublin",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Karachi",
  "Lahore",
  "Islamabad",
  "Riyadh",
  "Jeddah",
  "New York",
  "Toronto",
  "Miami",
  "Los Angeles",
  "Sydney",
  "Melbourne",
  "Bangkok",
  "Singapore",
  "Hong Kong",
];
export const insights = [
  {
    title: "A property page should answer the next question.",
    category: "DIGITAL EXPERIENCE",
    body: "Start with the essentials: location, layout, source and an honest next step. Let the imagery establish context, then make the enquiry journey easy to follow. This is an editorial checklist, not a measured conversion claim.",
  },
  {
    title: "Before a campaign goes live, give every claim a source.",
    category: "EVIDENCE & TRUST",
    body: "Record where a statement came from, when it was checked, and who approved it. Separate source records from live availability. A copied brochure is not a current inventory feed.",
  },
  {
    title: "Local context belongs in the brief.",
    category: "GROWTH STRATEGY",
    body: "Choose a city and define an audience, language, channel and test budget. Validate legal requirements with a qualified local adviser. Set a review date and a stopping rule before spending.",
  },
];
