import './_locals/Grid.css';

const Cells = ["leftTop", "centerTop", "rightTop", "leftCenter", "centerCenter", "rightCenter", "leftBottom", "centerBottom", "rightBottom"] as const;

type CellLocation = typeof Cells[number];

export class Grid {
  private cells: Partial<Record<CellLocation, HTMLElement>> = {};

  constructor(node: HTMLElement) {
    const gridNode = document.createElement('div');
    gridNode.classList.add('grid');
    node.appendChild(gridNode);

    Cells.forEach((cell: CellLocation) => {
      const cellNode = document.createElement("div");
      this.cells[cell] = cellNode;
      gridNode.appendChild(cellNode);
    })
  }

  get(location: CellLocation): HTMLElement {
    return this.cells[location] as HTMLElement;
  }
}
