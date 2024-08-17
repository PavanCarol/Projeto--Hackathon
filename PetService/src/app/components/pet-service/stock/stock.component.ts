import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialofAdicionarEstoqueComponent } from '../../../dialog/dialof-adicionar-estoque/dialof-adicionar-estoque.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequestService } from '../../../services/http-request.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
// Definir interfaces fora da classe para evitar erros de decoradores
interface EstoqueItem {
  cra6a_categoria: number;
  cra6a_nomeitem: string;
  cra6a_valor: number;
  cra6a_quantidade: number;
  cra6a_imagem: string;
  quantidadeAlterada?: boolean
}

interface CategoriaAgrupada {
  nome: string;
  itens: EstoqueItem[];
  isVisible: boolean;  // Adicione esta linha
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [MatIconModule,CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})

export class StockComponent {
 // Definição das propriedades existentes
 isEditVisible: boolean = false;
 isAnimating: boolean = false;
 selectedItem: EstoqueItem | null = null; // Item selecionado para edição

  displayedColumns: string[] = ['cra6a_nomeitem', 'cra6a_valor', 'cra6a_quantidade', 'actions'];


  constructor(
    public dialog: MatDialog,
    private estoqueService: HttpRequestService,
    private snackBar: MatSnackBar
  ) {}

  showEdit(item: EstoqueItem): void {
    this.selectedItem = item;
    this.isEditVisible = true;
    this.isAnimating = true;
    document.querySelector('.edit')?.classList.add('show');
  }
  
  hideEdit(): void {
    this.isAnimating = false;
    setTimeout(() => {
      this.isEditVisible = false;
      this.selectedItem = null;
      document.querySelector('.edit')?.classList.remove('show');
    }, 500);
  }
  estoqueItens: EstoqueItem[] = [];
  categoriasAgrupadas: CategoriaAgrupada[] = [];

  ngOnInit(): void {
    this.loadEstoqueItens();
  }

  loadEstoqueItens(): void {
    this.estoqueService.getEstoqueItens().subscribe(
      (data: EstoqueItem[]) => {
        this.estoqueItens = data;
        this.agruparPorCategoria();
      },
      (error) => {
        console.error('Erro ao carregar itens do estoque', error);
      }
    );
  }

 // Método para alternar a visibilidade das categorias
  toggleCategoria(categoriaSelecionada: CategoriaAgrupada): void {
    this.categoriasAgrupadas.forEach(categoria => {
      if (categoria === categoriaSelecionada) {
        categoria.isVisible = !categoria.isVisible;
      } else {
        categoria.isVisible = false;
      }
    });
  }

  agruparPorCategoria(): void {
    const categoriasMap: { [key: number]: string } = {
      0: 'Remédios',
      1: 'Brinquedos',
      2: 'Ração',
      3: 'Ossinhos e Petiscos',
      4: 'Higiene e Cosméticos',
      5: 'Roupas e Acessórios',
      6: 'Caminhas e Outros',
      7: 'Coleira Guias e Peitorais'
    };

    this.categoriasAgrupadas = this.estoqueItens.reduce((acc: CategoriaAgrupada[], item: EstoqueItem) => {
      const categoriaNome = categoriasMap[item.cra6a_categoria] || 'Desconhecida';
      let categoria = acc.find(cat => cat.nome === categoriaNome);
      if (!categoria) {
        categoria = { nome: categoriaNome, itens: [], isVisible: false };
        acc.push(categoria);
      }
      categoria.itens.push(item);
      return acc;
    }, []);
  }
  aumentarQuantidade(item: any): void {
    item.cra6a_quantidade++;
    item.quantidadeAlterada = true; // Marca que a quantidade foi alterada
  }

  diminuirQuantidade(item: any): void {
    if (item.cra6a_quantidade > 0) {
      item.cra6a_quantidade--;
      item.quantidadeAlterada = true; // Marca que a quantidade foi alterada
    }
  }

  salvarQuantidade(item: any): void {
    this.estoqueService.updateEstoqueItem(item).subscribe(
      (response) => {
        item.quantidadeAlterada = false; // Desmarca a alteração após salvar
        console.log('Quantidade atualizada com sucesso', response);
        this.snackBar.open('Alteração concluida com sucesso.', 'Fechar', {
          duration: 2000,
        });
        window.location.reload();
      },
      (error) => {
        console.error('Erro ao atualizar quantidade', error);
      }
    );
  }
  excluirItem(item: any): void {
    this.estoqueService.deleteEstoqueItem(item).subscribe(
      (response) => {
        this.snackBar.open('Item excluído com sucesso.', 'Fechar', {
          duration: 2000,
        });
        // Remova o item da lista após a exclusão
        this.loadEstoqueItens();
      },
      (error) => {
        console.error('Erro ao excluir item', error);
      }
    );}
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialofAdicionarEstoqueComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
