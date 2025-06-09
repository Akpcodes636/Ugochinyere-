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
  body?: PortableTextBlock[]; // You can make this more specific based on your PortableText schema
  content?: string;
} 

interface Params {
  params: {
    slug: string;
  };
}



export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const projects: Project[] = await client.fetch(
    `*[_type == "project"]{ slug }`
  );
  return projects.map((p) => ({ slug: p.slug.current }));
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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

        {/* More Projects Section */}
        {/* {otherProjects?.length > 0 && (
        <div className="px-4 my-40 container-sm mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-[#005effdd] border-b pb-2">
            More Projects You Might Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherProjects.map((p) => (
              <Link
                key={p._id}
                href={`/project/${p.slug.current}`}
                className="block rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 w-full">
                  {p.mainImage ? (
                    <img
                      src={urlFor(p.mainImage).url()}
                      alt={p.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full" />
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold px-2">{p.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )} */}
      </div>
      <Footer />
    </div>
  );
}
