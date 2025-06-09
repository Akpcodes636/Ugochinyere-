import Back from "@/app/components/ui/Back";
import { client } from "../../../sanity/lib/client";
import { urlFor } from "../../../sanity/lib/sanityImage";
import { PortableText } from "@portabletext/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { PortableTextBlock } from '@portabletext/types';

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset?: { _ref?: string; url?: string } };
  description?: string;
  body?: PortableTextBlock[];
  content?: string;
} 

interface PageProps {
  params: Promise<{ 
    slug: string;
  }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const projects: Project[] = await client.fetch(
    `*[_type == "project"]{ slug }`
  );
  return projects.map((p) => ({ slug: p.slug.current }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params; // Await the params Promise
  const project: Project = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{
      _id,
      title,
      mainImage,
      description,
      body,
      content
    }`,
    { slug }
  );

  return (
    <div className="w-full h-screen">
      <Header />
      <div className="py-2">
        {/* Post Header */}
        <div className=" relative">
          <div className="w-full">
            <Back />
            <div
              className="h-[50vh] sm:h-[50vh] flex flex-col"
              style={{
                background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${project.mainImage?.asset ? urlFor(project.mainImage).url() : ""})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1 className="blog-header thai-text text-center text-4xl text-white px-5">
                {project.title}
              </h1>

              {project.description && (
                <p className="text-white text-center text-[16px] mt-2 max-w-5xl px-4 sm:px-6 md:px-8 mx-auto leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Post Body */}
        <div className="space-y-4 px-4 sm:px-8 py-6 container mx-auto text-gray-800">
          <PortableText
            value={Array.isArray(project.content) ? project.content : []}
            components={{
              block: {
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mt-6 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium mt-4 mb-2">{children}</h3>
                ),
                normal: ({ children }) => (
                  <p className="mt-2 leading-relaxed">{children}</p>
                ),
              },
              list: {
                bullet: ({ children }) => (
                  <ul className="list-disc ml-6 space-y-1">{children}</ul>
                ),
              },
              listItem: {
                bullet: ({ children }) => <li>{children}</li>,
              },
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}