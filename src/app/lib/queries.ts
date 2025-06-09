export const portfolioQuery = `*[_type == "project"] | order(_createdAt desc)[0...6] {
  _id,
  title,
  slug,
  mainImage {
    asset -> {
      url
    }
  }
}`;
