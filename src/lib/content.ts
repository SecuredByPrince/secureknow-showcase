export const CONTACT = 'securedbyprince@gmail.com';
export const REFERENCE = 'https://github.com/SecuredByPrince/secureknow-reference-architecture';
export const subjects = {
    partner: 'SecureKnow — Partnership Enquiry', sponsor: 'SecureKnow — Sponsorship Enquiry',
    demo: 'SecureKnow — Demo Request', pilot: 'SecureKnow — Enterprise Pilot Interest', support: 'SecureKnow — Support Enquiry',
    general: 'SecureKnow — General Enquiry',
    collaborate: 'SecureKnow — Product and Research Collaboration', investment: 'SecureKnow — Strategic Funding Enquiry',
} as const;
export const messages = {
    partner: "Hello SecureKnow Team,\n\nI'd like to explore a technology partnership with SecureKnow.\n\nMy name:\nOrganisation:\nPartnership interest:\nProposed collaboration:\n\nThank you.",
    sponsor: "Hello SecureKnow Team,\n\nI'd like to discuss sponsorship or infrastructure support.\n\nOrganisation:\nSponsorship interest:\nContact name and details:\n\nThank you.",
    demo: "Hello SecureKnow Team,\n\nI'd like to request a demonstration of SecureKnow.\n\nOrganisation:\nMy role:\nPreferred meeting time:\nUse case:\n\nThank you.",
    pilot: "Hello SecureKnow Team,\n\nI'm interested in a carefully scoped enterprise pilot.\n\nOrganisation:\nDepartment:\nUse case:\nApproximate pilot team size:\nContact details:\n\nThank you.",
    collaborate: "Hello SecureKnow Team,\n\nI'd like to collaborate on SecureKnow's product or research.\n\nOrganisation or background:\nResearch or product interest:\nProposed collaboration:\nContact details:\n\nThank you.",
} as const;
export function emailLink(kind: keyof typeof subjects) {
    const body = kind in messages ? messages[kind as keyof typeof messages] : undefined;
    return `mailto:${CONTACT}?subject=${encodeURIComponent(subjects[kind])}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
}
export const capabilities = [
    {icon:'knowledge',name:'AI Knowledge Assistant',preview:'assistant',status:'Local foundation',text:'Answers from eligible published evidence, with visible sources and clear abstention.'},
    {icon:'document',name:'Document Governance',preview:'governance',status:'Local foundation',text:'Ownership, review, publication and protected version history.'},
    {icon:'policy',name:'Policy Decisions',preview:'policy',status:'Local foundation',text:'Explicit ALLOW, DENY and APPROVAL_REQUIRED outcomes. AI never grants authority.'},
    {icon:'research',name:'Knowledge Research Agent',preview:'research',status:'Planned / synthetic preview',text:'Compare sample documents, inspect evidence references and surface missing information.'},
    {icon:'passport',name:'Trust Passport',preview:'passport',status:'Planned / synthetic preview',text:'Explore how evidence, policy and human decisions should connect to a confirmed outcome.'},
] as const;
export const roadmap = [
    {title:'Completed locally',state:'local',items:['Product foundation and frontend refinement','Organisation binding and document governance','Published-evidence retrieval and deterministic policy foundations']},
    {title:'Current priorities',state:'current',items:['Real Microsoft Entra sign-in verification','Live AI and permission-aware RAG integration','Microsoft Foundry and Azure AI Search verification']},
    {title:'Upcoming',state:'future',items:['Knowledge Research, Workflow Automation and Knowledge Monitoring Agents','Durable workflows and native IT support ticket execution','Trust Passports, Microsoft 365 integrations, enterprise pilot and SaaS readiness']},
] as const;
export const partnerCategories = [
    {icon:'cloud',title:'Technology Partners',text:'Bring Microsoft/Azure, identity security and enterprise AI expertise to a focused engineering collaboration.',involvement:'Architecture reviews, integration expertise and secure platform design.',kind:'partner',cta:'Become a Partner'},
    {icon:'growth',title:'Sponsors and Infrastructure Supporters',text:'Help turn locally tested engineering into a carefully evaluated pilot.',involvement:'Cloud credits, model compute, test environments, infrastructure support and technical mentorship.',kind:'sponsor',cta:'Become a Sponsor'},
    {icon:'people',title:'Enterprise Pilot Organisations',text:'Shape a bounded evaluation around a real organisational knowledge problem.',involvement:'Agree the use case, authorised data scope, success criteria and human oversight before a pilot.',kind:'pilot',cta:'Join the Pilot'},
    {icon:'research',title:'Product and Research Collaborators',text:'Help test whether enterprise AI can stay useful within explicit trust boundaries.',involvement:'AI safety, secure agent orchestration, governance, evaluation and workflow design.',kind:'collaborate',cta:'Discuss Research Collaboration'},
] as const;
