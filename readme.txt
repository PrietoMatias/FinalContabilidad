Para generar una factura de compra en JavaScript o React que pueda imprimirse, puedes utilizar varias bibliotecas que facilitan la creación y el formato de documentos. Una opción popular es jspdf junto con html2canvas para capturar y convertir elementos HTML a un formato PDF que luego se puede imprimir. Aquí te muestro cómo hacerlo paso a paso.
Paso 1: Instalar las dependencias

Primero, necesitas instalar jspdf y html2canvas en tu proyecto. Puedes hacerlo usando npm o yarn:

bash

npm install jspdf html2canvas

Paso 2: Crear una función para generar el PDF

Crea una función que capture el contenido HTML y lo convierta en un PDF utilizando html2canvas y jspdf.

jsx

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const generarPDF = () => {
  const input = document.getElementById('factura');
  html2canvas(input)
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('factura.pdf');
    });
};

Paso 3: Crear el componente de la factura

Crea un componente para la factura y usa la función generarPDF para convertir el contenido del componente en un PDF.

jsx

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Factura = ({ carrito, subtotal, total }) => {
  const generarPDF = () => {
    const input = document.getElementById('factura');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('factura.pdf');
      });
  };

  return (
    <div>
      <div id="factura" style={{ padding: '20px', background: '#fff' }}>
        <h2>Factura de Compra</h2>
        <ul>
          {carrito.map(item => (
            <li key={item.id}>{item.nombre} - {item.cantidad} unidades - ${item.precio * item.cantidad}</li>
          ))}
        </ul>
        <h3>Subtotal: ${subtotal}</h3>
        <h3>Total: ${total}</h3>
      </div>
      <button onClick={generarPDF}>Generar Factura PDF</button>
    </div>
  );
};

export default Factura;

Paso 4: Integrar el componente de la factura en tu aplicación

Integra el componente Factura en tu aplicación principal y pásale los datos del carrito, subtotal y total.

jsx

function App() {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [carrito, setCarrito] = useState([]);

    useEffect(() => {
        if (localStorage.getItem('productos') === null) {
            localStorage.setItem('productos', JSON.stringify(productosIniciales));
        }
        const productosGuardados = localStorage.getItem('productos');
        if (productosGuardados) {
            setProductos(JSON.parse(productosGuardados));
        }
    }, []);

    const editarAgregar = (id, productosModificados) => {
        const index = productos.findIndex(p => p.id === id);
        if (index !== -1) {
            const productosNuevos = productos.map(p => p.id === id ? { ...p, ...productosModificados } : p);
            localStorage.setItem('productos', JSON.stringify(productosNuevos));
            setProductos(productosNuevos);
        } else {
            const copia = [...productos, { id: productos.length + 1, ...productosModificados }];
            localStorage.setItem('productos', JSON.stringify(copia));
            setProductos(copia);
        }
        setProductoSeleccionado(null);
    };

    const seleccionarProductoParaEditar = (producto) => {
        setProductoSeleccionado(producto);
    };

    const agregarAlCarrito = (id) => {
        const producto = productos.find(p => p.id === id);
        if (producto && producto.stock > 0) {
            const nuevoProducto = { ...producto, stock: producto.stock - 1 };
            const productosActualizados = productos.map(p => p.id === id ? nuevoProducto : p);
            localStorage.setItem('productos', JSON.stringify(productosActualizados));
            setProductos(productosActualizados);

            const carritoExistente = carrito.find(p => p.id === id);
            if (carritoExistente) {
                const carritoActualizado = carrito.map(p => p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p);
                setCarrito(carritoActualizado);
            } else {
                setCarrito([...carrito, { ...producto, cantidad: 1 }]);
            }
        }
    };

    const productosVacios = {
        id: null,
        nombre: '',
        stock: 0,
        precio: 0
    };

    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const total = subtotal; // Puedes añadir más cálculos como impuestos aquí si es necesario

    return (
        <>
            <Form {...(productoSeleccionado || productosVacios)} editarAgregar={editarAgregar} />
            <div className="tabla-productos">
                <table className="table table-dark table-sm">
                    <thead>
                        <tr>
                            <th scope="col">id</th>
                            <th scope="col">Nombre del Producto</th>
                            <th scope="col">Unidades</th>
                            <th scope="col">Precio</th>
                            <th scope="col">Acciones</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map(p => (
                            <tr key={p.id}>
                                <th scope="row">{p.id}</th>
                                <td>{p.nombre}</td>
                                <td>{p.stock}</td>
                                <td>{p.precio}</td>
                                <td><button type="button" className="btn btn-success" onClick={() => agregarAlCarrito(p.id)}>Carrito</button></td>
                                <td><button type="button" className="btn btn-warning" onClick={() => seleccionarProductoParaEditar(p)}>Editar</button></td>
                                <td><button type="button" className="btn btn-danger">Eliminar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Factura carrito={carrito} subtotal={subtotal} total={total} />
        </>
    );
}

Explicación

    Dependencias: Se instalan jspdf y html2canvas para capturar y convertir elementos HTML a PDF.
    Función generarPDF: Captura el contenido del elemento con id factura y lo convierte en un PDF.
    Componente Factura: Muestra los productos en el carrito y un botón para generar el PDF de la factura.
    Integración en App: Se integra el componente Factura y se pasa la información necesaria para generar la factura.

Con estos pasos, puedes generar una factura de compra en formato PDF y permitir que el usuario la imprima.




<ul>
        {carrito.map((item) => (
          <li key={item.id}>
            {item.nombre} - {item.cantidad} unidades - ${item.precio * item.cantidad}
          </li>
        ))}
      </ul>