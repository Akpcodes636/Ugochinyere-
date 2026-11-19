/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { BlogGrid } from "@/components/PostCard";
import {
  getGoogleProfiles,
  getPosts,
  getProjects,
  getTestimonials,
  LIMITS,
} from "@/lib/content";
import {
  absolute,
  AUDIT_URL,
  CONTACT_EMAIL,
  safeUrl,
  SITE_NAME,
  SITE_URL,
  SOCIALS,
  src,
  stars,
} from "@/lib/format";
import type { GoogleProfile, Project, Testimonial } from "@/lib/types";

// Re-build the page with fresh Supabase content at most once a minute
// (the admin panel also refreshes it instantly after every save).
export const revalidate = 60;

export const metadata = { alternates: { canonical: "/" } };

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="project">
      {p.image && (
        <Link href={`/projects/${p.slug}`} tabIndex={-1} aria-hidden="true">
          <img
            src={src(p.image)}
            alt={p.alt || p.title + " homepage screenshot"}
            loading="lazy"
          />
        </Link>
      )}
      <div className="info">
        <h3>
          <Link className="project-title" href={`/projects/${p.slug}`}>
            {p.title}
          </Link>
        </h3>
        {p.description && <p className="project-desc">{p.description}</p>}
        {p.tags && <p>{p.tags}</p>}
        <div className="project-links">
          <Link href={`/projects/${p.slug}`}>View project →</Link>
          {p.url && (
            <a href={safeUrl(p.url)} target="_blank" rel="noopener">
              Visit live website ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function GbpCard({ g }: { g: GoogleProfile }) {
  const rating = g.rating ? `${g.rating} ${stars(g.rating)}` : "";
  const count = g.reviews
    ? `${g.reviews} review${Number(g.reviews) === 1 ? "" : "s"}`
    : "";
  return (
    <article className="gbp-card">
      {g.image && (
        <img
          src={src(g.image)}
          alt={"Supplied Google search screenshot for " + g.name}
          loading="lazy"
        />
      )}
      <div className="gbp-info">
        <h3>{g.name}</h3>
        {g.category && <p>{g.category}</p>}
        {(rating || count) && (
          <div className="rating">
            {[rating, count].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </article>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="review">
      <div className="stars">{stars(t.stars)}</div>
      <blockquote>“{t.quote}”</blockquote>
      <strong>{t.name}</strong>
      {t.source && <small>{t.source}</small>}
    </article>
  );
}

export default async function Home() {
  const [projectsAll, profilesAll, testimonialsAll, postsAll] =
    await Promise.all([
      getProjects(),
      getGoogleProfiles(),
      getTestimonials(),
      getPosts(),
    ]);
  const projects = projectsAll.slice(0, LIMITS.projects);
  const profiles = profilesAll.slice(0, LIMITS.google_profiles);
  const testimonials = testimonialsAll.slice(0, LIMITS.testimonials);
  const posts = postsAll.slice(0, LIMITS.blog_posts);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": SITE_URL + "/#business",
        name: SITE_NAME,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        image: absolute("assets/images/founder.jpg"),
        description:
          "SEO-optimised website development, Google Business Profile setup and optimisation, SEO, AEO/GEO and keyword research.",
        founder: {
          "@type": "Person",
          "@id": SITE_URL + "/#founder",
          name: "Ugochinyere",
          jobTitle: "Digital Project Manager",
          image: absolute("assets/images/founder.jpg"),
          sameAs: [SOCIALS.linkedin, SOCIALS.upwork],
        },
        knowsAbout: [
          "Search Engine Optimisation",
          "Technical SEO",
          "Answer Engine Optimisation",
          "Generative Engine Optimisation",
          "Google Business Profile",
          "Keyword Research",
          "Website Development",
        ],
        areaServed: [
          "Nigeria",
          "United States",
          "Canada",
          "Australia",
          "United Kingdom",
          "Ireland",
        ],
        sameAs: [SOCIALS.instagram, SOCIALS.tiktok, SOCIALS.linkedin, SOCIALS.upwork],
        makesOffer: [
          "Website Development",
          "Google Business Profile",
          "SEO",
          "Keyword Research",
        ].map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
        })),
        ...(testimonials.length && {
          review: testimonials.map((t) => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name },
            reviewBody: t.quote,
            reviewRating: {
              "@type": "Rating",
              ratingValue: t.stars,
              bestRating: 5,
            },
          })),
        }),
      },
      {
        "@type": "WebSite",
        "@id": SITE_URL + "/#website",
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-GB",
        publisher: { "@id": SITE_URL + "/#business" },
      },
      {
        "@type": "WebPage",
        "@id": SITE_URL + "/#webpage",
        url: SITE_URL + "/",
        name: "SEO Websites & Google Business Profile Optimisation | The Digital PM",
        isPartOf: { "@id": SITE_URL + "/#website" },
        about: { "@id": SITE_URL + "/#business" },
        primaryImageOfPage: absolute("assets/images/founder.jpg"),
        inLanguage: "en-GB",
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">
              Visibility that supports business growth
            </div>
            <h1>Good products deserve to be seen.</h1>
            <p className="lead">
              If people are not finding your business, they cannot become your
              customers. Let&apos;s make it easier for the right people to
              discover you.
            </p>
            <p className="sub">
              I help businesses increase their online visibility through
              SEO-optimised website development, Google Business Profile setup
              and optimisation, and keyword research.
            </p>
            <div className="actions">
              <a className="button" href="#contact">
                Book a Call
              </a>
              <a className="button light" href="#work">
                See My Work
              </a>
            </div>
          </div>
          <div className="hero-shot">
            <img
              src="/assets/images/founder.jpg"
              alt="Portrait of Ugochinyere, founder of The Digital PM"
              fetchPriority="high"
            />
            <p className="founder-caption">
              Meet Ugochinyere — a Digital Project Manager helping businesses
              and organisations increase their brand visibility. She has worked
              with brands across Nigeria, the USA, Canada, Australia, the United
              Kingdom and Ireland. You are good at what you do. It’s time for
              the right people to see you.
            </p>
            <div className="founder-motto">
              <small>
                “Seest thou a man diligent in his business? he shall stand
                before kings; he shall not stand before mean men.”{" "}
                <strong>— Proverbs 22:29 (KJV)</strong>
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="problem">
        <div className="wrap problem-grid">
          <div>
            <div className="eyebrow">The visibility gap</div>
            <h2>
              You may not have a product problem. You may have a visibility
              problem.
            </h2>
            <p>
              You have a good product. You offer a valuable service. But if
              potential customers are not seeing your business when they search,
              they may be choosing someone else.
            </p>
            <p>
              When your website is difficult to find, your Google Business
              Profile is missing or incomplete, or your content isn&apos;t
              aligned with the words people search for, your business can remain
              invisible to the people who need it.
            </p>
          </div>
          <div>
            <p className="pull">
              “You can offer an excellent service, but the right customers need
              to be able to find you.”
            </p>
            <p>
              I help close that gap by building search-friendly websites and
              strengthening your presence on Google, so your business has a
              better foundation to be discovered.
            </p>
            <a className="button" href="#contact">
              Tell me what you are struggling with
            </a>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="wrap">
          <div className="heading">
            <div className="eyebrow">How I help</div>
            <h2>Practical services to improve your visibility.</h2>
            <p>
              Focused digital support to help more of the right people find and
              engage with your business.
            </p>
          </div>
          <div className="service-grid">
            <article className="service">
              <b>01</b>
              <h3>Website Development</h3>
              <p>
                Professional, user-friendly, SEO-optimised websites built around
                your business goals. Every build includes Google indexing setup
                and technical SEO foundations. Already have a website? I also
                audit websites to assess their SEO readiness and identify
                improvements.
              </p>
            </article>
            <article className="service">
              <b>02</b>
              <h3>Google Business Profile</h3>
              <p>
                Profile setup, verification guidance and optimisation so local
                customers can find your business on Google.
              </p>
            </article>
            <article className="service">
              <b>03</b>
              <h3>SEO</h3>
              <p>
                <strong>On-page SEO, technical SEO and content SEO</strong> to
                help search engines understand your website and improve your
                visibility in relevant searches.
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>
                  Answer Engine Optimisation (AEO) &amp; Generative Engine
                  Optimisation (GEO):
                </strong>{" "}
                We also help businesses make their information clearer to AI
                tools such as ChatGPT and Gemini, so these tools can better
                understand what the business offers and surface it when people
                search for relevant products or services.
              </p>
            </article>
            <article className="service">
              <b>04</b>
              <h3>Keyword Research</h3>
              <p>
                I research the keywords your potential customers use when
                searching for your type of product or service, then use those
                insights to help your business appear in relevant searches.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="audit" id="audit">
        <div className="wrap audit-inner">
          <div>
            <div className="eyebrow">Free business audit</div>
            <h2>How visible is your business right now?</h2>
            <p>
              Get a free audit of your online presence and see where customers
              may be missing you, from your website to your Google Business
              Profile.
            </p>
          </div>
          <a
            className="button accent"
            href={AUDIT_URL}
            target="_blank"
            rel="noopener"
          >
            Free Business Audit
          </a>
        </div>
      </section>

      {projects.length > 0 && (
        <section id="work">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">Selected website projects</div>
              <h2>Selected Projects</h2>
              <p>
                Custom websites built to help businesses communicate their
                value, reach their audience and generate enquiries. Every
                website is SEO-optimised, with Google indexing setup and
                technical SEO foundations included.
              </p>
            </div>
            <div className="project-grid" id="projects-list">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {profiles.length > 0 && (
        <section className="gbp" id="google">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">Google Business Profile projects</div>
              <h2>Real businesses. Real Google search results.</h2>
              <p>
                Examples of Google Business Profile setup and optimisation work,
                shown using the screenshots supplied from Google.
              </p>
            </div>
            <div className="gbp-grid" id="gbp-list">
              {profiles.map((g) => (
                <GbpCard key={g.id} g={g} />
              ))}
            </div>
            <p className="note">
              Ratings and review counts are reproduced as shown in the supplied
              screenshots and may change over time.
            </p>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section id="reviews">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">Client feedback</div>
              <h2>What clients are saying.</h2>
            </div>
            <div className="reviews" id="testimonials-list">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta" id="contact">
        <div className="wrap" style={{ maxWidth: 900, textAlign: "center" }}>
          <div className="eyebrow">Let&apos;s talk about your business</div>
          <h2
            style={{
              font: "500 clamp(34px,4vw,46px)/1.12 Georgia,serif",
              margin: "12px 0",
            }}
          >
            Ready to improve your online visibility?
          </h2>
          <p
            style={{
              maxWidth: 650,
              margin: "0 auto 22px",
              color: "#c8c0ba",
              fontSize: 15,
            }}
          >
            Tell me a little about your business, what you need help with and
            what you are hoping to achieve. I will review your enquiry and get
            back to you.
          </p>
          <EnquiryForm />
        </div>
      </section>

      <section id="blog" className="blog">
        <div className="wrap">
          <div className="heading">
            <div className="eyebrow">Ideas, guidance &amp; practical tips</div>
            <h2>From the Blog.</h2>
            <p>
              Insights on website development, SEO and building a stronger
              online presence for your business.
            </p>
          </div>
          <div id="blog-list">
            {posts.length ? (
              <>
                <BlogGrid posts={posts} />
                {postsAll.length > posts.length && (
                  <p style={{ textAlign: "center", marginTop: 28 }}>
                    <Link className="button light" href="/blog">
                      View all articles
                    </Link>
                  </p>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="eyebrow">Coming soon</div>
                <h3>Useful insights are on the way.</h3>
                <p>
                  This is where new articles, practical guides and digital
                  visibility tips will be published.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
