import { Product, SortOption } from "./Product";

const serverUrl: string = "http://localhost:5000/products";

let productsLoaded: number = 0;
const productsPerPage: number = 9;

let cartItems: Product[] = [];

const mobileScreenWidth: number = 1028;
let isMobileView: boolean =
  typeof window !== "undefined" && window.innerWidth <= mobileScreenWidth;

async function main(): Promise<void> {
  console.log(serverUrl);
  await loadInitialProducts();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", main);
}

async function loadInitialProducts(): Promise<void> {
  const initialProducts: Product[] = await loadProducts(0, productsPerPage);
  displayProducts(initialProducts);
  productsLoaded += initialProducts.length;
  await setupFilters();
  updateView();
}

async function loadProducts(start: number, limit: number): Promise<Product[]> {
  try {
    const response: Response = await fetch(
      `${serverUrl}?_start=${start}&_limit=${limit}`
    );
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }
}

function displayProducts(products: Product[]): void {
  const productsContainer: HTMLElement | null =
    document.querySelector(".product-grid");
  if (productsContainer) {
    products.forEach((product) => {
      const productElement: HTMLElement = createProductElement(product);
      productsContainer.appendChild(productElement);
    });
  }
}

function createProductElement(product: Product): HTMLElement {
  const productElement: HTMLElement = document.createElement("div");
  productElement.classList.add("product");
  productElement.dataset.color = product.color;
  productElement.dataset.size = product.size.join(",");
  productElement.dataset.price = product.price.toString();

  const imageElement: HTMLImageElement = document.createElement("img");
  imageElement.src = product.image;
  imageElement.alt = product.name;
  productElement.appendChild(imageElement);

  const nameElement: HTMLHeadingElement = document.createElement("h3");
  nameElement.textContent = product.name;
  productElement.appendChild(nameElement);

  const priceElement: HTMLParagraphElement = document.createElement("p");
  priceElement.textContent = `R$ ${product.price.toFixed(2)}`;
  productElement.appendChild(priceElement);

  if (product.parcelamento && product.parcelamento.length > 0) {
    const parcelaText = product.parcelamento.length > 1 ? "x" : "x";
    const parcelaValue = product.parcelamento[0];

    const spanParcelamento: HTMLSpanElement = document.createElement("span");
    spanParcelamento.classList.add("parcelamento");
    spanParcelamento.textContent = `até ${parcelaValue} ${parcelaText} de R$ ${(
      product.price / parcelaValue
    ).toFixed(2)}`;

    productElement.appendChild(spanParcelamento);
  }

  const buyButton: HTMLButtonElement = document.createElement("button");
  buyButton.textContent = "Comprar";
  buyButton.addEventListener("click", () => addToCart(product));
  productElement.appendChild(buyButton);

  return productElement;
}

function addToCart(product: Product): void {
  console.log(`Produto "${product.name}" adicionado ao carrinho.`);
  cartItems.push(product);
  updateCartCount(cartItems.length);
  showToast(`Produto "${product.name}" adicionado ao carrinho.`);

  const addButton = document.getElementById(
    `addButton_${product.id}`
  ) as HTMLButtonElement;
  if (addButton) {
    addButton.disabled = true;
  }
}

function showToast(message: string): void {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

function updateCartCount(count: number): void {
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement instanceof HTMLElement) {
    cartCountElement.textContent = count.toString();
  }
}

async function setupFilters(): Promise<void> {
  const colorFilter: HTMLElement | null =
    document.getElementById("color-filter");
  const sizeFilter: HTMLElement | null = document.getElementById("size-filter");
  const priceFilter: HTMLElement | null =
    document.getElementById("price-filter");

  if (colorFilter && sizeFilter && priceFilter) {
    const products: Product[] = await loadProducts(0, productsPerPage);
    const colors: Set<string> = new Set<string>();
    const sizes: Set<string> = new Set<string>();
    const prices: Set<number> = new Set<number>();

    products.forEach((product) => {
      colors.add(product.color);
      product.size.forEach((size) => sizes.add(size));
      prices.add(product.price);
    });

    populateListOptions(colors, colorFilter, "color");
    populateSizeFilter(sizes, sizeFilter, "size");
    populatePriceFilter(prices, priceFilter, "price");

    colorFilter.addEventListener("change", applyFilters);
    sizeFilter.addEventListener("click", applyFilters);
    priceFilter.addEventListener("change", applyFilters);
  }
}

function populateListOptions(
  options: Set<string | number>,
  filterElement: HTMLElement,
  filterName: string
): void {
  const listContainer = document.createElement("ul");
  options.forEach((option) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
          <label>
              <input type="checkbox" name="${filterName}" value="${option}" onchange="applyFilters()">
              <span>${getOptionLabel(option)}</span>
          </label>
      `;
    listContainer.appendChild(listItem);
  });
  filterElement.appendChild(listContainer);
}

function populateSizeFilter(
  sizes: Set<string>,
  filterElement: HTMLElement,
  filterName: string
): void {
  const sizeContainer: HTMLDivElement = document.createElement("div");
  sizeContainer.classList.add("size-container");

  Array.from(sizes).forEach((size, index) => {
    if (index % 4 === 0) {
      const rowElement: HTMLDivElement = document.createElement("div");
      rowElement.classList.add("size-row");
      sizeContainer.appendChild(rowElement);
    }

    const rowElements = sizeContainer.querySelectorAll(".size-row");
    const currentRow = rowElements[rowElements.length - 1];

    const optionElement: HTMLButtonElement = document.createElement("button");
    optionElement.type = "button";
    optionElement.textContent = size;
    optionElement.value = size;
    optionElement.addEventListener("click", () => toggleOption(optionElement));
    currentRow.appendChild(optionElement);
  });

  filterElement.appendChild(sizeContainer);
}

function getOptionLabel(option: string | number): string {
  if (typeof option === "number") {
    return `Até R$ ${option.toFixed(2)}`;
  } else {
    return option;
  }
}

function toggleOption(button: HTMLButtonElement): void {
  button.classList.toggle("selected");
  applyFilters();
}

function populatePriceFilter(
  prices: Set<number>,
  filterElement: HTMLElement,
  filterName: string
): void {
  filterElement.innerHTML = "";

  const priceContainer = document.createElement("div");
  priceContainer.classList.add("price-container");

  const titleElement = document.createElement("h3");
  titleElement.textContent = "Faixa de Preço";

  priceContainer.appendChild(titleElement);

  const priceList = document.createElement("ul");

  [
    { min: 0, max: 50 },
    { min: 51, max: 150 },
    { min: 151, max: 300 },
    { min: 301, max: 500 },
    { min: 501, max: Number.POSITIVE_INFINITY },
  ].forEach((range) => {
    const listItem = document.createElement("li");
    const label =
      range.max === Number.POSITIVE_INFINITY
        ? "Acima de 500"
        : `de R$ ${range.min} - R$ ${range.max}`;
    listItem.innerHTML = `
          <input type="checkbox" name="${filterName}" value="${range.min},${range.max}" onchange="applyFilters()">
          <span>${label}</span>
      `;
    priceList.appendChild(listItem);
  });

  priceContainer.appendChild(priceList);

  filterElement.appendChild(priceContainer);

  const footerFilter = document.createElement("div");
  footerFilter.classList.add("footer-filter");

  const applyButton = document.createElement("button");
  applyButton.textContent = "Aplicar";
  applyButton.addEventListener("click", () => {
    applyFilters();
    closeFiltersContainer();
  });
  footerFilter.appendChild(applyButton);

  const clearButton = document.createElement("button");
  clearButton.textContent = "Limpar";
  clearButton.addEventListener("click", () => {
    clearFilters();
    applyFilters();
  });
  footerFilter.appendChild(clearButton);

  const priceFilterElement = document.getElementById("price-filter");
  if (priceFilterElement) {
    priceFilterElement.insertAdjacentElement("afterend", footerFilter);
  } else {
    console.error('Elemento com id "price-filter" não encontrado.');
  }
}

function clearFilters(): void {
  const colorFilter = document.getElementById("color-filter");
  const sizeFilter = document.getElementById("size-filter");
  const priceFilter = document.getElementById("price-filter");

  if (colorFilter) {
    const checkboxes = colorFilter.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (checkbox instanceof HTMLInputElement) {
        checkbox.checked = false;
      }
    });
  }

  if (sizeFilter) {
    const buttons = sizeFilter.querySelectorAll(".size-row button.selected");
    buttons.forEach((button) => {
      button.classList.remove("selected");
    });
  }

  if (priceFilter) {
    const checkboxes = priceFilter.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (checkbox instanceof HTMLInputElement) {
        checkbox.checked = false;
      }
    });
  }
}

function closeFiltersContainer(): void {
  const filtersContainer = document.querySelector(
    ".filters-container"
  ) as HTMLElement | null;
  if (filtersContainer) {
    filtersContainer.style.display = "none";
  }
}

function applyFilters(): void {
  const colorFilter: NodeListOf<HTMLInputElement> =
    document.querySelectorAll<HTMLInputElement>('input[name="color"]:checked');
  const sizeFilter: NodeListOf<HTMLButtonElement> =
    document.querySelectorAll<HTMLButtonElement>(".size-row button.selected");
  const priceFilter: NodeListOf<HTMLInputElement> =
    document.querySelectorAll<HTMLInputElement>('input[name="price"]:checked');

  const selectedColors: string[] = Array.from(colorFilter).map(
    (input) => input.value
  );
  const selectedSizes: string[] = Array.from(sizeFilter).map(
    (button) => button.value
  );
  const selectedPrices: { min: number; max: number }[] = Array.from(
    priceFilter
  ).map((input) => {
    const [min, max]: number[] = input.value.split(",").map(Number);
    return { min, max };
  });

  const productsContainer: HTMLElement | null =
    document.querySelector(".product-grid");
  if (productsContainer) {
    const products: HTMLElement[] = Array.from(
      productsContainer.children
    ) as HTMLElement[];
    products.forEach((product) => {
      const productColor: string | undefined = product.dataset.color;
      const productSizes: string[] = product.dataset.size.split(",");
      const productPrice: number = parseFloat(product.dataset.price);

      const isVisible: boolean =
        (selectedColors.length === 0 ||
          selectedColors.includes(productColor as string)) &&
        (selectedSizes.length === 0 ||
          selectedSizes.some((size) => productSizes.includes(size))) &&
        (selectedPrices.length === 0 ||
          selectedPrices.some(
            (priceRange) =>
              productPrice >= priceRange.min && productPrice <= priceRange.max
          ));

      product.style.display = isVisible ? "block" : "none";
    });
  }
}

function sortByLowestPrice(): void {
  const productsContainer: HTMLElement | null =
    document.querySelector(".product-grid");
  if (productsContainer) {
    const products: HTMLElement[] = Array.from(
      productsContainer.children
    ) as HTMLElement[];

    products.sort((a, b) => {
      const priceA: number = parseFloat(a.dataset.price);
      const priceB: number = parseFloat(b.dataset.price);
      return priceA - priceB;
    });

    products.forEach((product) => {
      productsContainer.appendChild(product);
    });
  }
}

function sortByHighestPrice(): void {
  const productsContainer: HTMLElement | null =
    document.querySelector(".product-grid");
  if (productsContainer) {
    const products: HTMLElement[] = Array.from(
      productsContainer.children
    ) as HTMLElement[];

    products.sort((a, b) => {
      const priceA: number = parseFloat(a.dataset.price);
      const priceB: number = parseFloat(b.dataset.price);
      return priceB - priceA;
    });

    products.forEach((product) => {
      productsContainer.appendChild(product);
    });
  }
}

const sortLowestPriceButton: HTMLElement | null =
  document.querySelector(".sort-lowest-price");
const sortHighestPriceButton: HTMLElement | null = document.querySelector(
  ".sort-highest-price"
);

if (sortLowestPriceButton) {
  sortLowestPriceButton.addEventListener("click", sortByLowestPrice);
}

if (sortHighestPriceButton) {
  sortHighestPriceButton.addEventListener("click", sortByHighestPrice);
}

const cartCountElement: HTMLElement | null =
  document.querySelector(".cart-count");
if (cartCountElement) {
  cartCountElement.addEventListener("click", () => {
    openCartModal(cartItems);
  });
}

function openCartModal(cartItems: Product[]): void {
  const modalContent: HTMLDivElement = document.createElement("div");
  modalContent.classList.add("modal-content");

  const closeButton: HTMLSpanElement = document.createElement("span");
  closeButton.classList.add("close");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", closeCartModal);
  modalContent.appendChild(closeButton);

  const itemList: HTMLUListElement = document.createElement("ul");
  cartItems.forEach((item) => {
    const listItem: HTMLLIElement = document.createElement("li");
    listItem.textContent = item.name;
    itemList.appendChild(listItem);
  });
  modalContent.appendChild(itemList);

  const modal: HTMLDivElement = document.createElement("div");
  modal.classList.add("modal");
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

function closeCartModal(): void {
  const modal: HTMLDivElement | null = document.querySelector(".modal");
  if (modal) {
    document.body.removeChild(modal);
  }
}

const loadMoreButton: HTMLElement | null =
  document.querySelector(".load-more");
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", loadMoreProducts);
}

async function loadMoreProducts(): Promise<void> {
  try {
    const products: Product[] = await loadProducts(
      productsLoaded,
      productsPerPage
    );
    console.log(products);
    if (products.length > 0) {
      displayProducts(products);
      productsLoaded += products.length;
      await setupFilters();
      if (productsLoaded >= 14) {
        const loadMoreButton: HTMLElement | null =
          document.querySelector(".load-more");
        if (loadMoreButton) {
          loadMoreButton.setAttribute("disabled", "true");
        }
      }
    } else {
      console.log("Não há mais produtos para carregar.");
    }
  } catch (error) {
    console.error("Erro ao carregar mais produtos:", error);
  }
}

function toggleFiltersContainer(): void {
  const filtersContainer: HTMLElement | null =
    document.querySelector(".filters-container");
  if (filtersContainer) {
    if (
      filtersContainer.style.display === "none" ||
      filtersContainer.style.display === ""
    ) {
      filtersContainer.style.display = "block";
    } else {
      filtersContainer.style.display = "none";
    }
  }
}

const filterToggle: HTMLElement | null =
  document.querySelector(".filter-toggle");
if (filterToggle) {
  filterToggle.addEventListener("click", toggleFiltersContainer);
}

function toggleFilterItems(h3Element: Element): void {
  const filterItems: HTMLElement | null =
    h3Element.nextElementSibling as HTMLElement | null;

  if (filterItems) {
    const isDisplayed = filterItems.classList.contains("show");

    filterItems.classList.toggle("show", !isDisplayed);
  }
}

function setupFilterToggle(): void {
  const filterHeadings: NodeListOf<Element> =
    document.querySelectorAll(".filter-section h3");

  filterHeadings.forEach((h3) => {
    const existingArrow = h3.querySelector(".arrow");
    if (!existingArrow) {
      const arrowSpan = document.createElement("span");
      arrowSpan.classList.add("arrow");

      h3.appendChild(arrowSpan);
    }

    h3.addEventListener("click", () => {
      toggleFilterItems(h3);

      const arrowSpan = h3.querySelector(".arrow");
      if (arrowSpan) {
        arrowSpan.classList.toggle("rotated");
      }
    });
  });
}

function addMobileFilterBar(): void {
  if (window.matchMedia("(max-width: 1000px)").matches) {
    const filterBar = document.querySelector(".filter-bar");
    if (!filterBar) {
      const newFilterBar = document.createElement("div");
      newFilterBar.classList.add("filter-bar");
      newFilterBar.innerHTML = `<h3>FILTROS</h3><button class="filter-toggle">X</button>`;
      const filtersSection = document.querySelector(".filters-container");
      filtersSection?.insertBefore(newFilterBar, filtersSection.firstChild);

      const mobileFilterToggle: HTMLElement | null = document.querySelector(
        ".filter-bar .filter-toggle"
      );
      if (mobileFilterToggle) {
        mobileFilterToggle.addEventListener("click", toggleFiltersContainer);
      }
    }
  } else {
    const filterBar = document.querySelector(".filter-bar");
    if (filterBar) {
      filterBar.remove();
    }
  }
}

function updateView(): void {
  isMobileView = window.innerWidth <= mobileScreenWidth;

  if (isMobileView) {
    addMobileFilterBar();
  } else {
    const filtersContainer: HTMLElement | null =
      document.querySelector(".filters-container");
    if (filtersContainer) {
      filtersContainer.style.display = window.innerWidth <= 1027 ? "none" : "";
    }
  }
  setupFilterToggle();
}

window.addEventListener("resize", updateView);

window.addEventListener("DOMContentLoaded", () => {
  const filtersContainer: HTMLElement | null =
    document.querySelector(".filters-container");
  if (filtersContainer && window.innerWidth === 1027) {
    filtersContainer.style.display = "none";
  }
});

function createSortModal(sortOptions: SortOption[]): void {
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");
  modalOverlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header"><h2>Ordenar</h2><button class="close-button">X</button></div>
      <div class="modal-section">${sortOptions
        .map((option) => `<a href="${option.label}">${option.label}</a>`)
        .join("")}</div>
    </div>`;

  const closeButton = modalOverlay.querySelector(".close-button");
  closeButton?.addEventListener("click", () =>
    document.body.removeChild(modalOverlay)
  );

  const applyButton = modalOverlay.querySelector(".modal-footer button");
  applyButton?.addEventListener("click", () =>
    document.body.removeChild(modalOverlay)
  );

  document.body.appendChild(modalOverlay);
}

const sortToggle = document.querySelector(".sort-toggle");
if (sortToggle) {
  sortToggle.addEventListener("click", () => {
    const sortOptions = [
      { label: "Mais Recentes", action: () => console.log("Mais Recentes") },
      { label: "Mais Baratos", action: () => console.log("Mais Baratos") },
      { label: "Mais Caros", action: () => console.log("Mais Caros") },
    ];
    createSortModal(sortOptions);
  });
}

window.addEventListener("resize", updateView);

export {
  applyFilters,
  toggleOption,
  populatePriceFilter,
  isMobileView,
  updateView,
  loadProducts,
};
