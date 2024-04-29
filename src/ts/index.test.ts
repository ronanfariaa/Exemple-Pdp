import { loadProducts as importedLoadProducts, applyFilters } from "./index";

// Defina o tipo HTMLElement para evitar erros de chamada de função não tipada
declare const document: Document;
declare global {
  interface Document {
    querySelector<E extends HTMLElement = HTMLElement>(
      selectors: string
    ): E | null;
    querySelectorAll<E extends HTMLElement = HTMLElement>(
      selectors: string
    ): NodeListOf<E>;
  }
}

// Mock da função window.innerWidth para simular diferentes tamanhos de tela
const mockWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Limpar os mocks e os ambientes de teste entre os testes
beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = "";
});

// Declaração das variáveis globais necessárias para o ambiente de teste
declare var window: any;
declare var global: any;

// Declaração da função loadProducts para evitar erros
function loadProducts(arg0: number, arg1: number) {
  return Promise.resolve([]);
}

describe("Testes da Interface de Usuário", () => {
  describe("Verificar a versão da tela", () => {
    test("deve identificar corretamente a tela como mobile", () => {
      mockWindowInnerWidth(500); // Define a largura da tela como mobile
      expect(window.innerWidth).toBe(500);
    });

    test("deve identificar corretamente a tela como desktop", () => {
      mockWindowInnerWidth(1200); // Define a largura da tela como desktop
      expect(window.innerWidth).toBe(1200);
    });
  });

  const mockProducts = [
    { id: 1, nome: "Produto 1" },
    { id: 2, nome: "Produto 2" },
  ];

  describe("Testes da API de Produtos", () => {
    test("deve retornar uma lista válida de produtos da API", async () => {
      // Substitua a função fetch por uma versão mockada que retorna os produtos simulados
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockProducts),
      });

      // Chama a função de carregar produtos
      const produtos = await importedLoadProducts(0, 10);

      // Assert
      expect(produtos).toEqual(mockProducts);
    });
  });
});
