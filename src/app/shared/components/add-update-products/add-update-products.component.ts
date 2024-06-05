import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Productos } from 'src/app/model/producto.model';

@Component({
  selector: 'app-add-update-products',
  templateUrl: './add-update-products.component.html',
  styleUrls: ['./add-update-products.component.scss'],
})
export class AddUpdateProductsComponent implements OnInit {

  @Input() producto: Productos;

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    price: new FormControl(null, [Validators.required, Validators.min(0)]),
    tipo: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required, Validators.minLength(4)]),
    fecha: new FormControl('', [Validators.required]),
    presupuesto: new FormControl(null, [Validators.required, Validators.min(0)]),
    cantidad: new FormControl(null, [Validators.required, Validators.min(1)]),
    valorTotal: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    proveedor: new FormControl('', [Validators.required]),
  });

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    if (this.producto) {
      this.form.patchValue(this.producto);
    }
    // Observar cambios en la cantidad y el precio para actualizar el valor total
    this.form.get('cantidad').valueChanges.subscribe(() => {
      this.updateTotalValue();
    });
    this.form.get('price').valueChanges.subscribe(() => {
      this.updateTotalValue();
    });
  }

  submit() {
    if (this.form.valid) {
      this.form.get('valorTotal').enable();  // Habilitar el campo antes de enviar el formulario
      if (this.producto) {
        this.updateProduct();
      } else {
        this.createProduct();
      }
    }
  }

  async createProduct() {
    const path = 'products';
    const loading = await this.utilsService.loading();
    await loading.present();

    const formValue = this.form.getRawValue();  // Obtener todos los valores, incluidos los deshabilitados

    delete this.form.value.id;

    this.firebaseService.addDocument(path, this.form.value).then(async () => {
      this.utilsService.dismissModal({ success: true });

      this.utilsService.presentToast({
        message: 'Producto creado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);
      this.handleError(error.message);
    }).finally(() => {
      loading.dismiss();
    });
  }

  async updateProduct() {
    const path = `products/${this.producto.id}`;
    const loading = await this.utilsService.loading();
    await loading.present();

    const formValue = this.form.getRawValue();  // Obtener todos los valores, incluidos los deshabilitados

    delete this.form.value.id;

    this.firebaseService.UpdateDocument(path, this.form.value).then(async () => {
      this.utilsService.dismissModal({ success: true });

      this.utilsService.presentToast({
        message: 'Producto actualizado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);
      this.handleError(error.message);
    }).finally(() => {
      loading.dismiss();
    });
  }

  handleError(errorMessage: string) {
    this.utilsService.presentToast({
      message: errorMessage,
      duration: 2500,
      color: 'primary',
      position: 'middle',
      icon: 'alert-circle-outline'
    });
  }

  private updateTotalValue() {
    const quantity = this.form.get('cantidad').value;
    const price = this.form.get('price').value;
    const total = quantity * price;
    this.form.get('valorTotal').setValue(total);
    // Establecer el valor total como un placeholder
    this.form.get('valorTotal').setValidators([Validators.required]); // Hacer que el campo sea requerido
    this.form.get('valorTotal').updateValueAndValidity(); // Actualizar la validación
  }
}
