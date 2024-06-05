import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductsComponent } from 'src/app/shared/components/add-update-products/add-update-products.component';
import { Productos } from 'src/app/model/producto.model';
import { take } from 'rxjs/operators'; // Importamos el operador take

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  products: Productos[] = [];
  filteredProductos: Productos[] = [];
  searchTerm: string = '';
  filterType: string = '';

  constructor(
    private utilService: UtilsService,
    private fireSvc: FirebaseService
  ) {}

  ngOnInit() {
    this.getProductos(); // Llamamos a getProductos() en ngOnInit
  }

  async addUpdateProduct(producto?: Productos) {
    let success = await this.utilService.presentModal({
      component: AddUpdateProductsComponent,
      cssClass: 'add-update-modal',
      componentProps: { producto, products: this.products } // Pasamos los productos al componente modal
    });
    if(success) this.getProductos(); // Llamamos a getProductos() solo si se realizan cambios
  }

  ionViewWillEnter() {
    // No se necesita getProductos() aquí ya que se llama en ngOnInit
  }

  getProductos() {
    const path = 'products';

    this.fireSvc.getDatos(path).pipe(take(1)).subscribe({ // Usamos take(1)
      next: (res: any) => {
        console.log(res);
        this.products = res;
        this.applyFilters(); // Aplicamos los filtros una vez que los datos se carguen
      }
    });
  }

  applyFilters() {
    this.filteredProductos = this.products.filter(producto => {
      const nameMatches = producto.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const typeMatches = !this.filterType || producto.tipo === this.filterType;
      return nameMatches && typeMatches;
    });
  }

  async presentAlertConfirm(producto: Productos) {
    this.utilService.presentAlert({
      header: 'Eliminar!',
      message: '¿Quieres Eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteProduct(producto);
          }
        }
      ]
    });
  }

  async deleteProduct(producto: Productos) {
    let path = `products/${producto.id}`;

    const loading = await this.utilService.loading();
    await loading.present();

    this.fireSvc.deleteDocument(path).then(async res => {
      // Eliminamos el producto directamente del array products
      this.products = this.products.filter(p => p.id !== producto.id);
      this.applyFilters(); // Aplicamos los filtros nuevamente después de eliminar el producto

      this.utilService.presentToast({
        message: 'Producto Eliminado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);

      if (error instanceof Error) { // Verificamos si error es una instancia de Error
        this.utilService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    }).finally(() => {
      loading.dismiss();
    });
  }
}
