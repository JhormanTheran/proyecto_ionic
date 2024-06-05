export interface Productos {
  id: string;
  name: string; // Esto corresponde a 'Producto: Descripción'
  price: number; // Esto corresponde a 'Valor Unitario: Costo por producto'
  tipo: string; // Esto corresponde a 'Unidad: Departamento responsable'
  descripcion: string; // Esto ya está incluido como 'Descripción'
  fecha: string; // Esto corresponde a 'Fecha de Adquisición del producto'
  imageUrl?: string; // Campo opcional para la URL de la imagen del producto, si es necesario
  presupuesto: number; // Corresponde a 'Presupuesto: Monto asignado'
  cantidad: number; // Corresponde a 'Cantidad: Número de unidades del producto'
  valorTotal: number; // Corresponde a 'Valor Total: Costo total'
  proveedor: string; // Corresponde a 'Proveedor: Entidad proveedora'
}
