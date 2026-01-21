;(() => {
  // Prevent multiple injections
  if (window.__productAnalysisInjected) return
  window.__productAnalysisInjected = true

  // State
  const state = {
    view: "pill", // 'pill' | 'loading' | 'modal'
    isBookmarked: false,
    isDarkMode: false,
    expandedSections: {},
    product: null,
    analysis: null,
    location: null,
  }

  // Create root element
  const root = document.createElement("div")
  root.id = "product-analysis-root"
  document.body.appendChild(root)

  // SVG Icons
  const icons = {
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
    bookmarkFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    scissors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
    shirt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  }

  // Detect product on page
  function detectProduct() {
    const hostname = window.location.hostname.toLowerCase()
    let product = { title: "", image: "", price: "", brand: "", url: window.location.href, category: "", materials: "" }

    // Try site-specific detection first
    if (hostname.includes("revolve.com")) {
      product = detectRevolve()
    } else if (hostname.includes("zara.com")) {
      product = detectZara()
    } else if (hostname.includes("asos.com")) {
      product = detectAsos()
    } else if (hostname.includes("nordstrom.com")) {
      product = detectNordstrom()
    } else if (hostname.includes("shopbop.com")) {
      product = detectShopbop()
    } else if (hostname.includes("net-a-porter.com") || hostname.includes("mrporter.com")) {
      product = detectNetAPorter()
    } else if (hostname.includes("ssense.com")) {
      product = detectSsense()
    } else if (hostname.includes("farfetch.com")) {
      product = detectFarfetch()
    } else {
      product = detectGeneric()
    }

    // Fallback to generic if site-specific failed
    if (!product.title) {
      product = detectGeneric()
    }

    product.url = window.location.href
    console.log("[Product Analysis] Detected product:", product)
    return product
  }

  // Revolve.com
  function detectRevolve() {
    const title =
      document
        .querySelector('h1.product-name, h1[data-testid="product-name"], .product-title h1')
        ?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content?.split(" | ")[0]?.trim() ||
      ""
    const brand =
      document.querySelector('.product-brand a, .brand-name, [data-testid="product-brand"]')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content?.split(" | ")[1]?.trim() ||
      ""
    const priceEl = document.querySelector(
      '.product-price .sale-price, .product-price .price, [data-testid="product-price"]',
    )
    const price =
      priceEl?.textContent?.trim() || document.querySelector('meta[property="product:price:amount"]')?.content || ""
    const image =
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector(".product-gallery img, .pdp-image img")?.src ||
      ""

    // Get materials/composition
    const detailsText =
      document.querySelector('.product-details, .details-content, [data-testid="product-details"]')?.textContent || ""
    const materialsMatch = detailsText.match(/(\d+%\s*\w+[\s,]*)+/gi)
    const materials = materialsMatch ? materialsMatch[0] : ""

    // Detect category from breadcrumbs or title
    const breadcrumbs =
      document.querySelector('.breadcrumbs, nav[aria-label="breadcrumb"]')?.textContent?.toLowerCase() || ""
    const category = detectCategory(title, breadcrumbs)

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Zara.com
  function detectZara() {
    const title =
      document.querySelector("h1.product-detail-info__header-name")?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = "Zara"
    const price = document.querySelector(".price__amount-current, .money-amount__main")?.textContent?.trim() || ""
    const image =
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector(".media-image__image img")?.src ||
      ""
    const materials = document.querySelector(".product-detail-composition")?.textContent?.trim() || ""
    const category = detectCategory(title, document.body.textContent)

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // ASOS
  function detectAsos() {
    const title =
      document.querySelector('h1[data-test-id="product-title"]')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = document.querySelector('[data-test-id="product-brand"]')?.textContent?.trim() || "ASOS"
    const price = document.querySelector('[data-test-id="current-price"]')?.textContent?.trim() || ""
    const image = document.querySelector('meta[property="og:image"]')?.content || ""
    const materials = document.querySelector('[data-test-id="product-composition"]')?.textContent?.trim() || ""
    const category = detectCategory(title, "")

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Nordstrom
  function detectNordstrom() {
    const title =
      document.querySelector('h1[itemprop="name"]')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = document.querySelector('[itemprop="brand"]')?.textContent?.trim() || ""
    const price = document.querySelector('[data-testid="product-price"]')?.textContent?.trim() || ""
    const image = document.querySelector('meta[property="og:image"]')?.content || ""
    const materials = document.querySelector('[data-testid="product-details"]')?.textContent || ""
    const category = detectCategory(title, "")

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Shopbop
  function detectShopbop() {
    const title =
      document.querySelector("h1.pdp-title")?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = document.querySelector(".brand-link")?.textContent?.trim() || ""
    const price = document.querySelector(".pdp-price")?.textContent?.trim() || ""
    const image = document.querySelector('meta[property="og:image"]')?.content || ""
    const materials = document.querySelector(".product-detail-content")?.textContent || ""
    const category = detectCategory(title, "")

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Net-a-Porter / Mr Porter
  function detectNetAPorter() {
    const title =
      document.querySelector("h2.product-name")?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = document.querySelector("a.designer-name")?.textContent?.trim() || ""
    const price = document.querySelector(".price-amount")?.textContent?.trim() || ""
    const image = document.querySelector('meta[property="og:image"]')?.content || ""
    const materials = document.querySelector(".accordion-content")?.textContent || ""
    const category = detectCategory(title, "")

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // SSENSE
  function detectSsense() {
    const title =
      document.querySelector('h1[data-testid="product-name"]')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = document.querySelector('[data-testid="product-brand"]')?.textContent?.trim() || ""
    const price = document.querySelector('[data-testid="product-price"]')?.textContent?.trim() || ""
    const image = document.querySelector('meta[property="og:image"]')?.content || ""
    const materials = document.querySelector('[data-testid="product-composition"]')?.textContent || ""
    const category = detectCategory(title, "")

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Farfetch
  function detectFarfetch() {
    const title =
      document.querySelector('h1[data-testid="product-name"]')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      ""
    const brand = document.querySelector('[data-testid="product-brand"]')?.textContent?.trim() || ""
    const price = document.querySelector('[data-testid="price-main"]')?.textContent?.trim() || ""
    const image = document.querySelector('meta[property="og:image"]')?.content || ""
    const materials = document.querySelector('[data-testid="composition"]')?.textContent || ""
    const category = detectCategory(title, "")

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Generic fallback detection
  function detectGeneric() {
    // Try Open Graph tags first
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content
    const ogImage = document.querySelector('meta[property="og:image"]')?.content
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.content

    // Try structured data
    const ldJson = document.querySelector('script[type="application/ld+json"]')
    let structuredData = null
    if (ldJson) {
      try {
        structuredData = JSON.parse(ldJson.textContent)
        if (Array.isArray(structuredData))
          structuredData = structuredData.find((d) => d["@type"] === "Product") || structuredData[0]
      } catch (e) {}
    }

    // Title
    const title = structuredData?.name || ogTitle || document.querySelector("h1")?.textContent?.trim() || ""

    // Brand
    const brand =
      structuredData?.brand?.name ||
      ogSiteName ||
      document.querySelector('[itemprop="brand"]')?.textContent?.trim() ||
      window.location.hostname.replace("www.", "").split(".")[0]

    // Price
    let price =
      structuredData?.offers?.price || document.querySelector('meta[property="product:price:amount"]')?.content || ""
    if (!price) {
      const priceSelectors = ['[itemprop="price"]', ".price", '[class*="price"]', "[data-price]"]
      for (const sel of priceSelectors) {
        const el = document.querySelector(sel)
        if (el) {
          const match = el.textContent.match(/[$£€][\d,]+\.?\d*/)
          if (match) {
            price = match[0]
            break
          }
        }
      }
    }

    // Image
    const image =
      structuredData?.image ||
      ogImage ||
      document.querySelector('[itemprop="image"]')?.src ||
      document.querySelector('img[src*="product"]')?.src ||
      ""

    // Materials - look for composition/materials text
    let materials = ""
    const pageText = document.body.textContent
    const materialsMatch = pageText.match(/(?:composition|materials?|fabric)[:\s]*(\d+%\s*\w+[\s,]*)+/gi)
    if (materialsMatch) {
      materials = materialsMatch[0].replace(/composition|materials?|fabric/gi, "").trim()
    }

    const category = detectCategory(title, pageText)

    return { title, brand, price: formatPrice(price), image, materials, category }
  }

  // Helper to detect product category
  function detectCategory(title, context) {
    const text = (title + " " + context).toLowerCase()

    const categories = {
      outerwear: ["coat", "jacket", "blazer", "trench", "parka", "cardigan", "sweater", "hoodie", "vest"],
      tops: ["top", "blouse", "shirt", "tee", "t-shirt", "tank", "cami", "turtleneck", "bodysuit", "crop"],
      bottoms: ["pants", "jeans", "trousers", "shorts", "skirt", "leggings"],
      dresses: ["dress", "gown", "romper", "jumpsuit"],
      shoes: ["shoe", "boot", "heel", "sandal", "sneaker", "loafer", "flat", "pump"],
      bags: ["bag", "purse", "clutch", "tote", "backpack", "handbag"],
      accessories: ["scarf", "hat", "belt", "jewelry", "necklace", "bracelet", "earring", "watch", "sunglasses"],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return category
      }
    }
    return "other"
  }

  // Helper to format price
  function formatPrice(price) {
    if (!price) return "$0"
    const numMatch = price.toString().match(/[\d,]+\.?\d*/)
    if (numMatch) {
      return "$" + numMatch[0].replace(/,/g, "")
    }
    return price
  }

  // Generate analysis based on location
  function generateAnalysis(product, location) {
    const lat = location.latitude
    const month = new Date().getMonth()
    const isTropical = Math.abs(lat) < 23.5
    const isNorthern = lat > 0
    const isWinter = isNorthern ? month >= 10 || month <= 2 : month >= 4 && month <= 8
    const isSummer = isNorthern ? month >= 5 && month <= 8 : month >= 11 || month <= 2

    // Analyze materials
    const materialsLower = (product.materials || "").toLowerCase()
    const naturalFibers = ["cotton", "wool", "silk", "linen", "cashmere", "leather"]
    const syntheticFibers = ["polyester", "nylon", "acrylic", "spandex", "elastane", "viscose", "rayon"]

    let naturalPercent = 0
    let syntheticPercent = 0
    let fabricRating = "GOOD"
    let fabricVerdict = ""
    const compositionText = product.materials || "Materials not listed"

    // Parse percentages from materials string
    const percentMatches = materialsLower.match(/(\d+)%\s*(\w+)/g) || []
    for (const match of percentMatches) {
      const [, percent, fiber] = match.match(/(\d+)%\s*(\w+)/) || []
      const pct = Number.parseInt(percent) || 0
      if (naturalFibers.some((f) => fiber.includes(f))) {
        naturalPercent += pct
      } else if (syntheticFibers.some((f) => fiber.includes(f))) {
        syntheticPercent += pct
      }
    }

    // Determine fabric rating based on composition
    if (naturalPercent >= 80) {
      fabricRating = "GOOD"
      fabricVerdict = "Love this! Mostly natural fibers, breathable and long-lasting."
    } else if (naturalPercent >= 50) {
      fabricRating = "FAIR"
      fabricVerdict = "Mixed bag. Some natural fibers but quite a bit of synthetic too."
    } else if (syntheticPercent > 0 || percentMatches.length > 0) {
      fabricRating = "NOT GREAT"
      fabricVerdict = "Heads up, mostly synthetic. Won't breathe well and may not last."
    } else {
      // No materials detected
      fabricRating = "UNKNOWN"
      fabricVerdict = "Can't find the materials info. Check the label before buying."
      naturalPercent = 50
      syntheticPercent = 50
    }

    // Weather/wearability based on category and location
    let weatherScore, weatherLabel, wearabilityVerdict, wearabilityRating
    const isOuterwear = product.category === "outerwear"
    const isHeavy = /coat|jacket|parka|wool|fur|down/i.test(product.title)

    if (isTropical && isHeavy) {
      weatherScore = 1
      weatherLabel = `${location.city} is tropical, skip this`
      wearabilityVerdict = `Babe, you'd look out of place wearing this on the streets of ${location.city}. It's way too hot.`
      wearabilityRating = "POOR"
    } else if (isTropical && isOuterwear) {
      weatherScore = 2
      weatherLabel = `Maybe for AC only`
      wearabilityVerdict = `Only useful for over-air-conditioned places in ${location.city}. Limited use tbh.`
      wearabilityRating = "FAIR"
    } else if (isWinter && isHeavy) {
      weatherScore = 5
      weatherLabel = `Perfect for ${location.city} winters!`
      wearabilityVerdict = `Yes! This is exactly what you need for ${location.city} right now. You'll get so much wear.`
      wearabilityRating = "GREAT"
    } else if (isSummer && isHeavy) {
      weatherScore = 2
      weatherLabel = `Too warm for ${location.city} rn`
      wearabilityVerdict = `Cute but you won't wear it for months. Maybe wait for fall?`
      wearabilityRating = "FAIR"
    } else if (isOuterwear) {
      weatherScore = 4
      weatherLabel = `Great for ${location.city} right now`
      wearabilityVerdict = `Perfect timing! You'll get tons of wear out of this.`
      wearabilityRating = "GOOD"
    } else {
      weatherScore = 4
      weatherLabel = `Works for ${location.city}`
      wearabilityVerdict = `This works for ${location.city}'s weather. Versatile piece.`
      wearabilityRating = "GOOD"
    }

    // Style analysis based on product attributes
    const titleLower = product.title.toLowerCase()
    let silhouette = "Classic"
    if (/oversized|relaxed|loose/i.test(titleLower)) silhouette = "Oversized"
    else if (/fitted|slim|tailored/i.test(titleLower)) silhouette = "Fitted"
    else if (/cropped|crop/i.test(titleLower)) silhouette = "Cropped"
    else if (/mini/i.test(titleLower)) silhouette = "Mini"
    else if (/midi/i.test(titleLower)) silhouette = "Midi"
    else if (/maxi/i.test(titleLower)) silhouette = "Maxi"

    // Detect color from title
    const colors = [
      "black",
      "white",
      "ivory",
      "cream",
      "beige",
      "brown",
      "tan",
      "camel",
      "navy",
      "blue",
      "red",
      "pink",
      "green",
      "grey",
      "gray",
      "burgundy",
      "purple",
      "orange",
      "yellow",
      "gold",
      "silver",
      "multi",
    ]
    let color = "Neutral"
    for (const c of colors) {
      if (titleLower.includes(c)) {
        color = c.charAt(0).toUpperCase() + c.slice(1)
        break
      }
    }

    // Generate style verdict
    const styleRating = "GOOD"
    const styleVerdict = `${silhouette} ${color.toLowerCase()} ${product.category || "piece"}. Versatile addition to your wardrobe.`

    // Mock closet items based on category
    const closetByCategory = {
      outerwear: ["Vintage Burberry trench", "COS wool coat", "Zara blazer"],
      tops: ["Everlane black turtleneck", "Silk cami", "Oversized white shirt"],
      bottoms: ["Agolde jeans", "Pleated trousers", "Black mini skirt"],
      dresses: ["Reformation midi dress", "Slip dress", "Knit maxi"],
      shoes: ["Black ankle boots", "White sneakers", "Strappy heels"],
      bags: ["Celine belt bag", "Tote bag", "Clutch"],
      accessories: ["Gold hoops", "Silk scarf", "Leather belt"],
      other: ["Basic tee", "Cashmere sweater"],
    }
    const closetItems = closetByCategory[product.category] || closetByCategory.other

    // Styling tips based on the item
    const stylingTips = generateStylingTips(product, silhouette, color)

    return {
      style: {
        rating: styleRating,
        verdict: styleVerdict,
        attributes: { silhouette, color, texture: getMaterialTexture(product.materials) },
        closetItems: closetItems.slice(0, 2),
        stylingTips,
      },
      wearability: {
        rating: wearabilityRating,
        verdict: wearabilityVerdict,
        weather: { score: weatherScore, label: weatherLabel },
        occasion: { score: 3, label: "Versatile for most occasions" },
      },
      fabric: {
        rating: fabricRating,
        composition: compositionText,
        naturalPercent: naturalPercent || (fabricRating === "UNKNOWN" ? 50 : 0),
        syntheticPercent: syntheticPercent || (fabricRating === "UNKNOWN" ? 50 : 0),
        verdict: fabricVerdict,
      },
      alternatives: generateAlternatives(product),
    }
  }

  // Helper to get texture description from materials
  function getMaterialTexture(materials) {
    if (!materials) return "Unknown"
    const m = materials.toLowerCase()
    if (m.includes("silk")) return "Smooth silk"
    if (m.includes("wool")) return "Soft wool"
    if (m.includes("cashmere")) return "Luxe cashmere"
    if (m.includes("cotton")) return "Cotton"
    if (m.includes("linen")) return "Textured linen"
    if (m.includes("leather")) return "Leather"
    if (m.includes("denim")) return "Denim"
    if (m.includes("velvet")) return "Plush velvet"
    if (m.includes("satin")) return "Smooth satin"
    return "Mixed fabric"
  }

  // Generate styling tips based on product
  function generateStylingTips(product, silhouette, color) {
    const tips = []
    const category = product.category

    if (category === "outerwear") {
      tips.push("Over a turtleneck + jeans for everyday")
      tips.push("Belt it at the waist over a dress")
      tips.push("Leave open over matching tonal pieces")
    } else if (category === "tops") {
      tips.push("Tuck into high-waisted trousers")
      tips.push("Layer under a blazer for work")
      tips.push("Pair with your favorite jeans")
    } else if (category === "bottoms") {
      tips.push("Style with a tucked-in knit")
      tips.push("Add heels for evening")
      tips.push("Sneakers for a casual vibe")
    } else if (category === "dresses") {
      tips.push("Add a leather belt to define the waist")
      tips.push("Layer a cardigan for cooler days")
      tips.push("Boots in winter, sandals in summer")
    } else {
      tips.push("Keep accessories minimal to let it shine")
      tips.push("Style with neutrals for versatility")
      tips.push("Mix with existing pieces in your closet")
    }

    return tips
  }

  // Generate alternatives based on product
  function generateAlternatives(product) {
    const category = product.category

    const alternativesByCategory = {
      outerwear: [
        { name: "Classic Trench", brand: "COS", price: "$290", url: "#" },
        { name: "Wool Coat", brand: "Arket", price: "$259", url: "#" },
      ],
      tops: [
        { name: "Silk Blouse", brand: "& Other Stories", price: "$89", url: "#" },
        { name: "Cotton Tee", brand: "Everlane", price: "$35", url: "#" },
      ],
      bottoms: [
        { name: "Wide Leg Jeans", brand: "Agolde", price: "$198", url: "#" },
        { name: "Tailored Pants", brand: "COS", price: "$135", url: "#" },
      ],
      dresses: [
        { name: "Midi Dress", brand: "Reformation", price: "$218", url: "#" },
        { name: "Slip Dress", brand: "& Other Stories", price: "$99", url: "#" },
      ],
      default: [
        { name: "Similar Style", brand: "COS", price: "$150", url: "#" },
        { name: "Budget Alternative", brand: "H&M", price: "$49", url: "#" },
      ],
    }

    return alternativesByCategory[category] || alternativesByCategory.default
  }

  // Render score bars
  function renderScoreBars(score) {
    const scoreClass = score <= 2 ? "poor" : score <= 3 ? "fair" : "good"
    let html = '<div class="pa-score-bars">'
    for (let i = 1; i <= 5; i++) {
      html += `<div class="pa-score-bar ${i <= score ? "active " + scoreClass : ""}"></div>`
    }
    html += "</div>"
    return html
  }

  // Render pill view
  function renderPill() {
    return `
      <div class="pa-overlay ${state.isDarkMode ? 'dark-mode' : ''}">
        <div class="pa-pill">
          <button class="pa-pill-btn scan" id="pa-scan-btn">
            ${icons.sparkles}
          </button>
          <button class="pa-pill-btn bookmark" id="pa-bookmark-btn">
            ${state.isBookmarked ? icons.bookmarkFilled : icons.bookmark}
          </button>
        </div>
      </div>
    `
  }

  // Render loading view
  function renderLoading() {
    return `
      <div class="pa-overlay ${state.isDarkMode ? 'dark-mode' : ''}">
        <div class="pa-loader">
          <div class="pa-loader-dots">
            <div class="pa-loader-dot"></div>
            <div class="pa-loader-dot"></div>
            <div class="pa-loader-dot"></div>
            <div class="pa-loader-dot"></div>
          </div>
          <div class="pa-loader-text">Analyzing this piece for you...</div>
        </div>
      </div>
    `
  }

  // Render section
  function renderSection(id, icon, title, rating, summary, content) {
    const isOpen = state.expandedSections[id]
    const ratingClass = rating === "GOOD" || rating === "GREAT" ? "good" : rating === "FAIR" ? "fair" : "poor"

    return `
      <div class="pa-section" data-section="${id}">
        <div class="pa-section-header">
          <div class="pa-section-title">
            <span class="pa-section-icon">${icon}</span>
            <span class="pa-section-name">${title}</span>
            <span class="pa-section-pill ${ratingClass}">${rating}</span>
          </div>
          <span class="pa-section-chevron ${isOpen ? "open" : ""}">${icons.chevronRight}</span>
        </div>
        ${!isOpen ? `<div class="pa-section-summary">${summary}</div>` : ""}
        ${isOpen ? `<div class="pa-section-content">${content}</div>` : ""}
      </div>
    `
  }

  // Render modal view
  function renderModal() {
    const { product, analysis } = state
    if (!product || !analysis) return renderPill()

    const styleContent = `
      <div class="pa-style-chips">
        <span class="pa-chip silhouette">${analysis.style.attributes.silhouette}</span>
        <span class="pa-chip color">${analysis.style.attributes.color}</span>
        <span class="pa-chip texture">${analysis.style.attributes.texture}</span>
      </div>
      <div class="pa-closet-label">Similar to your</div>
      <div class="pa-style-chips">
        ${analysis.style.closetItems.map((item) => `<span class="pa-chip closet">${item}</span>`).join("")}
      </div>
      <div class="pa-verdict">${analysis.style.verdict}</div>
      <div class="pa-tips-label">How to style it</div>
      <ul class="pa-tips-list">
        ${analysis.style.stylingTips.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    `

    const wearabilityContent = `
      <div class="pa-verdict">${analysis.wearability.verdict}</div>
      <div class="pa-wearability-cards">
        <div class="pa-wearability-card">
          <div class="pa-wearability-card-header">
            <span class="pa-wearability-icon weather">${icons.cloud}</span>
            <div class="pa-score-group">
              ${renderScoreBars(analysis.wearability.weather.score)}
              <span class="pa-score-text">${analysis.wearability.weather.score}/5</span>
            </div>
          </div>
          <div class="pa-wearability-card-title">Weather</div>
          <div class="pa-wearability-card-desc">${analysis.wearability.weather.label}</div>
        </div>
        <div class="pa-wearability-card">
          <div class="pa-wearability-card-header">
            <span class="pa-wearability-icon occasion">${icons.calendar}</span>
            <div class="pa-score-group">
              ${renderScoreBars(analysis.wearability.occasion.score)}
              <span class="pa-score-text">${analysis.wearability.occasion.score}/5</span>
            </div>
          </div>
          <div class="pa-wearability-card-title">Occasion</div>
          <div class="pa-wearability-card-desc">${analysis.wearability.occasion.label}</div>
        </div>
      </div>
    `

    const fabricContent = `
      <div class="pa-fabric-bar">
        ${analysis.fabric.naturalPercent > 0 ? `<div class="pa-fabric-segment natural" style="width: ${analysis.fabric.naturalPercent}%">${analysis.fabric.composition}</div>` : ""}
        ${analysis.fabric.syntheticPercent > 0 ? `<div class="pa-fabric-segment synthetic" style="width: ${analysis.fabric.syntheticPercent}%">${analysis.fabric.syntheticPercent}% Synthetic</div>` : ""}
      </div>
      <div class="pa-fabric-verdict">${analysis.fabric.verdict}</div>
    `

    const alternativesContent = `
      <div class="pa-alternatives">
        ${analysis.alternatives
          .map(
            (alt) => `
          <a href="${alt.url}" class="pa-alternative" target="_blank">
            <div class="pa-alternative-image"></div>
            <div class="pa-alternative-info">
              <div class="pa-alternative-name">${alt.name}</div>
              <div class="pa-alternative-meta">${alt.brand} · ${alt.price}</div>
            </div>
            <span class="pa-alternative-arrow">${icons.arrowRight}</span>
          </a>
        `,
          )
          .join("")}
      </div>
    `

    const styleSummary = `${analysis.style.verdict} Similar to your ${analysis.style.closetItems.join(" and ")}.`

    return `
      <div class="pa-overlay ${state.isDarkMode ? 'dark-mode' : ''}">
        <div class="pa-modal">
          <div class="pa-header">
            <div class="pa-header-actions">
              <button class="pa-header-btn" id="pa-dark-mode-btn">${icons.moon}</button>
              <button class="pa-header-btn ${state.isBookmarked ? "active" : ""}" id="pa-modal-bookmark-btn">
                ${state.isBookmarked ? icons.bookmarkFilled : icons.bookmark}
              </button>
              <button class="pa-header-btn" id="pa-close-btn">${icons.x}</button>
            </div>
          </div>
          <div class="pa-content">
            <div class="pa-product-card">
              <img class="pa-product-image" src="${product.image}" alt="${product.title}" onerror="this.style.background='#f3f4f6'">
              <div class="pa-product-info">
                <div class="pa-product-name">${product.title}</div>
                <div class="pa-product-meta">${product.brand} · ${product.price}</div>
              </div>
            </div>
            ${renderSection("style", icons.scissors, "Style", analysis.style.rating, styleSummary, styleContent)}
            ${renderSection("wearability", icons.cloud, "Wearability", analysis.wearability.rating, analysis.wearability.verdict, wearabilityContent)}
            ${renderSection("fabric", icons.layers, "Fabric Composition", analysis.fabric.rating, analysis.fabric.composition, fabricContent)}
            ${renderSection("alternatives", icons.shirt, "Alternatives", "GOOD", "Similar styles at different price points", alternativesContent)}
          </div>
        </div>
      </div>
    `
  }

  // Render based on state
  function render() {
    let html = ""
    switch (state.view) {
      case "pill":
        html = renderPill()
        break
      case "loading":
        html = renderLoading()
        break
      case "modal":
        html = renderModal()
        break
    }
    root.innerHTML = html
    attachEventListeners()
  }

  function attachEventListeners() {
    // Pill view buttons
    const scanBtn = document.getElementById("pa-scan-btn")
    if (scanBtn) {
      scanBtn.addEventListener("click", startScan)
    }

    const bookmarkBtn = document.getElementById("pa-bookmark-btn")
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", toggleBookmark)
    }

    // Modal view buttons
    const darkModeBtn = document.getElementById("pa-dark-mode-btn")
    if (darkModeBtn) {
      darkModeBtn.addEventListener("click", toggleDarkMode)
    }

    const modalBookmarkBtn = document.getElementById("pa-modal-bookmark-btn")
    if (modalBookmarkBtn) {
      modalBookmarkBtn.addEventListener("click", toggleBookmark)
    }

    const closeBtn = document.getElementById("pa-close-btn")
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal)
    }

    // Section headers
    const sections = document.querySelectorAll(".pa-section")
    sections.forEach((section) => {
      const header = section.querySelector(".pa-section-header")
      if (header) {
        header.addEventListener("click", () => {
          const id = section.dataset.section
          toggleSection(id)
        })
      }
    })
  }

  // Action functions
  async function startScan() {
    state.view = "loading"
    render()

    state.product = detectProduct()
    state.location = { latitude: 0, city: "Unknown" } // Placeholder for getLocation
    state.analysis = generateAnalysis(state.product, state.location)

    setTimeout(() => {
      state.view = "modal"
      render()
    }, 2000)
  }

  function toggleBookmark() {
    state.isBookmarked = !state.isBookmarked
    render()
  }

  function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode
    render()
  }

  function toggleSection(id) {
    state.expandedSections[id] = !state.expandedSections[id]
    render()
  }

  function closeModal() {
    state.view = "pill"
    state.expandedSections = {}
    render()
  }

  function toggle() {
    if (state.view === "pill") {
      startScan()
    } else {
      closeModal()
    }
  }

  // Listen for messages from background
  const chrome = window.chrome // Declare the chrome variable
  if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "toggle") {
        toggle()
      }
    })
  }

  // Initial render
  render()

  console.log("[Product Analysis] Extension loaded successfully")
})()
