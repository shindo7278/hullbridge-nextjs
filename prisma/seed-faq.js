// ============================================================
// One-time setup: creates a sensible default set of FAQs covering
// the most common patient questions. Run with: npm run seed:faq
// Edit or add more any time from /admin/faq.
// ============================================================
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_FAQS = [
  // Booking
  {
    question: "How do I book an appointment?",
    answer: "You can book online at any time using our online booking system, or call us on 01702 231 067 during opening hours. Walk-ins are also welcome.",
    category: "Booking",
    sortOrder: 0,
  },
  {
    question: "What are your opening hours?",
    answer: "We are open Monday 9:00–17:00, Wednesday and Thursday 10:00–17:00, and Friday 10:00–17:00. We are closed Tuesday, Saturday and Sunday. Hours may vary — please call ahead to confirm.",
    category: "Booking",
    sortOrder: 1,
  },
  {
    question: "What happens if I need to cancel my appointment?",
    answer: "Please give us at least 24 hours' notice if you need to cancel or reschedule. Cancellations with less than 24 hours' notice may incur a £35 failed appointment fee.",
    category: "Booking",
    sortOrder: 2,
  },
  {
    question: "Do you see emergency patients?",
    answer: "Yes — call us as early in the day as possible and we will do our best to see you the same day.",
    category: "Booking",
    sortOrder: 3,
  },
  // Pricing
  {
    question: "How much does a new patient examination cost?",
    answer: "A new patient examination costs £33.00. This includes a full assessment of your teeth, gums and soft tissues.",
    category: "Pricing",
    sortOrder: 0,
  },
  {
    question: "Do you offer NHS treatment?",
    answer: "We are an independent dental practice, not an NHS practice. However, our prices are set to closely match NHS charges wherever possible.",
    category: "Pricing",
    sortOrder: 1,
  },
  {
    question: "Will I always get a price before treatment starts?",
    answer: "Yes. We provide a clear written treatment plan and quotation before any work begins — no surprises.",
    category: "Pricing",
    sortOrder: 2,
  },
  // Treatments
  {
    question: "Do you offer teeth whitening?",
    answer: "Yes. We offer professional home whitening kits from £375.00. These use custom-fitted trays and professional-strength gel for safe, even results.",
    category: "Treatments",
    sortOrder: 0,
  },
  {
    question: "Can you help with nervous patients?",
    answer: "Absolutely. Many of our patients feel anxious about dental visits, and our team takes time to explain every step and work at a pace you are comfortable with.",
    category: "Treatments",
    sortOrder: 1,
  },
  {
    question: "Do you provide dental implants?",
    answer: "We offer implant consultations and guidance. Where placement is needed, we refer to a trusted specialist and support you through the whole process.",
    category: "Treatments",
    sortOrder: 2,
  },
  // General
  {
    question: "Where are you located?",
    answer: "We are at 130 Ferry Road, Hullbridge, Essex, SS5 6EU — with parking available nearby.",
    category: "General",
    sortOrder: 0,
  },
  {
    question: "How do I register as a new patient?",
    answer: "Simply book a new patient examination online or call us on 01702 231 067. We will take your details when you arrive for your first appointment.",
    category: "General",
    sortOrder: 1,
  },
];

async function main() {
  const existing = await prisma.generalFaq.count();
  if (existing > 0) {
    console.log(`ℹ️  FAQs already exist (${existing}) — skipping. Edit from /admin/faq instead.`);
    return;
  }

  for (const faq of DEFAULT_FAQS) {
    await prisma.generalFaq.create({
      data: { ...faq, isPublished: true },
    });
  }

  console.log(`✅ Created ${DEFAULT_FAQS.length} default FAQs. Edit any time at /admin/faq.`);
}

main()
  .catch((err) => { console.error("Seed failed:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
