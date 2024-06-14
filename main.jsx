const { useState, useEffect, createContext, useReducer, useContext, useRef } = React;

const productosIniciales = [
  {
    id: 1,
    nombre: "Leche Descremada La Serenísima",
    stock: 10,
    precio: 120
  },
  {
    id: 2,
    nombre: "Harina 000 Coto",
    stock: 50,
    precio: 80
  },
  {
    id: 3,
    nombre: "Huevos Blancos Granja Blanca x 30",
    stock: 20,
    precio: 350
  },
  {
    id: 4,
    nombre: "Carne Vacuna Molida",
    stock: 15,
    precio: 600
  },
  {
    id: 5,
    nombre: "Pollo Fresco",
    stock: 10,
    precio: 450
  },
  {
    id: 6,
    nombre: "Arroz Blanco Doble Carolina",
    stock: 25,
    precio: 150
  },
  {
    id: 7,
    nombre: "Fideos Spaghetti Nº 5 Luchetti",
    stock: 30,
    precio: 80
  },
  {
    id: 8,
    nombre: "Tomates Perita Chocón",
    stock: 20,
    precio: 100
  },
  {
    id: 9,
    nombre: "Papas",
    stock: 30,
    precio: 120
  },
  {
    id: 10,
    nombre: "Manzanas Rojas",
    stock: 25,
    precio: 150
  },
  {
    id: 11,
    nombre: "Bananas",
    stock: 20,
    precio: 100
  },
  {
    id: 12,
    nombre: "Cerveza Brahma Lager",
    stock: 15,
    precio: 250
  },
  {
    id: 13,
    nombre: "Coca Cola 2.5 L",
    stock: 10,
    precio: 300
  },
  {
    id: 14,
    nombre: "Agua Mineral Villa del Sur 1.5 L",
    stock: 20,
    precio: 60
  },
  {
    id: 15,
    nombre: "Café Nescafé Clásico",
    stock: 15,
    precio: 200
  },
  {
    id: 16,
    nombre: "Té Ser Supremo",
    stock: 20,
    precio: 180
  },
  {
    id: 17,
    nombre: "Shampoo Head & Shoulders",
    stock: 10,
    precio: 350
  },
  {
    id: 18,
    nombre: "Jabón Lux",
    stock: 15,
    precio: 100
  },
  {
    id: 19,
    nombre: "Papel Higiénico Scott Doble Hoja",
    stock: 12,
    precio: 200
  },
  {
    id: 20,
    nombre: "Detergente Ala Matic",
    stock: 8,
    precio: 300
  }
]

const ProductosContext = createContext()

const productosReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTOS':
      return { ...state, productos: action.payload };
    case 'AGREGAR_PRODUCTO':
      return { ...state, productos: [...state.productos, action.payload] };
    case 'EDITAR_PRODUCTO':
      const productosEditados = state.productos.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      return { ...state, productos: productosEditados };
    case 'ELIMINAR_PRODUCTO':
      const productosEliminados = state.productos.filter(
        (p) => p.id !== action.payload
      );
      return { ...state, productos: productosEliminados };
    case 'AGREGAR_AL_CARRITO':
      const producto = state.productos.find((p) => p.id === action.payload);
      if (producto && producto.stock > 0) {
        const nuevoProducto = { ...producto, stock: producto.stock - 1 };
        const productosActualizados = state.productos.map((p) =>
          p.id === action.payload ? nuevoProducto : p
        );

        const carritoExistente = state.carrito.find(
          (p) => p.id === action.payload
        );
        const carritoActualizado = carritoExistente
          ? state.carrito.map((p) =>
            p.id === action.payload ? { ...p, cantidad: p.cantidad + 1 } : p
          )
          : [...state.carrito, { ...producto, cantidad: 1 }];

        return { ...state, productos: productosActualizados, carrito: carritoActualizado };
      }
      return state;
    case 'SET_CARRITO':
      return { ...state, carrito: action.payload };
    case 'VACIAR_CARRITO':
      // Restaura el stock de los productos en el carrito
      const productosConStockRestaurado = state.productos.map(producto => {
        const productoEnCarrito = state.carrito.find(item => item.id === producto.id);
        if (productoEnCarrito) {
          return { ...producto, stock: producto.stock + productoEnCarrito.cantidad };
        }
        return producto;
      });

      return { ...state, carrito: [], productos: productosConStockRestaurado };
    default:
      return state;
  }
};

const ProductosProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productosReducer, {
    productos: [],
    carrito: [],
  });

  useEffect(() => {
    if (localStorage.getItem('productos') === null) {
      localStorage.setItem('productos', JSON.stringify(productosIniciales));
    }
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      dispatch({ type: 'SET_PRODUCTOS', payload: JSON.parse(productosGuardados) });
    }
  }, []);

  return (
    <ProductosContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductosContext.Provider>
  );
};

const useProductos = () => {
  const context = useContext(ProductosContext);
  if (!context) {
    throw new Error('useProductos must be used within a ProductosProvider');
  }
  return context;
};


const Carrito = () => {
  const [formdata, setFormdata] = useState({
    nombre: '',
    domicilio: '',
    cuit: '',
  })
  const { state, dispatch } = useProductos();
  const componentRef = useRef()

  const generatePDF = () => {
    window.html2canvas(componentRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, width, height, '', 'FAST');
      pdf.save('factura.pdf');
    });
  };
  const getFormattedDate = () => {
    const fecha = new Date();
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0-11
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const fechaActual = getFormattedDate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormdata(prevState => ({
      ...prevState, [name]: value
    })
    )
  }
  const { carrito } = state;
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const total = subtotal;
  const vaciarCarrito = () => ({
    type: 'VACIAR_CARRITO',
  });

  const handleVaciar = () => {
    dispatch(vaciarCarrito());
  };
  return (
    <>
      <form className="mb-3">
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={formdata.nombre}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="domicilio" className="form-label">Domicilio</label>
          <input
            type="text"
            className="form-control"
            name="domicilio"
            value={formdata.domicilio}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cuit" className="form-label">Cuit</label>
          <input
            type="text"
            className="form-control"
            name="cuit"
            value={formdata.cuit}
            onChange={handleChange}
          />
        </div>
      </form>
      <div className="invoice-box" id='facturacPDF' ref={componentRef}>
        <table cellPadding="0" cellSpacing="0">
          <tr className="top">
            <td colSpan="4">
              <table>
                <tr>
                  <td className="title-section" colSpan="2">
                    <h1>VacasFood SRL</h1>
                  </td>
                  <td colSpan="2" className="align-right">
                    <div className="facturac">Factura C</div>
                    <div className="header">N° 0001 - 00000001</div>
                  </td>
                </tr>
                <tr>
                  <td colSpan="4">
                    <div className="sub-header">Domicilio: Saenz Peña 522</div>
                    <div className="sub-header">Código postal 4000 - Provincia: Tucuman</div>
                    <div className="sub-header">RESPONSABLE MONOTRIBUTO</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr className="information">
            <td colSpan="4">
              <table>
                <tr>
                  <td colSpan="2">
                    Señor(es): {!formdata.nombre ? '..................................................' : formdata.nombre}<br />
                    Domicilio: {!formdata.domicilio ? '..................................................' : formdata.domicilio}
                  </td>
                  <td colSpan="2" className="align-right">
                    CUIT N°: 439231203<br />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr className="heading">
            <td colSpan="4">
              <div>I&nbsp;&nbsp;V&nbsp;&nbsp;A</div>
              <label className="checkbox-label"><input type="checkbox" /> Resp. Ins.</label>
              <label className="checkbox-label"><input type="checkbox" /> Monotributo</label>
              <label className="checkbox-label"><input type="checkbox" /> Exento</label>
              <label className="checkbox-label"><input type="checkbox" /> No Respns.</label>
              <label className="checkbox-label"><input type="checkbox" /> Cons. Final</label> <br />
              <span className="align-right">CUIT N° {!formdata.cuit ? '.......................................' : formdata.cuit}</span>
            </td>
          </tr>
          <tr className="heading">
            <td colSpan="4">
              <div className="conditions">
                <div>Cond. de Venta</div>
                <label className="checkbox-label"><input type="checkbox" /> Contado</label>
                <label className="checkbox-label"><input type="checkbox" /> Cta. Cte.</label>
                <label className="checkbox-label"><input type="checkbox" /> Tarjeta</label>
                <span className="align-right">REMITO N° ..................................................</span>
              </div>
            </td>
          </tr>
          <tr className="heading">
            <td>CANT</td>
            <td>DETALLE</td>
            <td>P. UNIT.</td>
            <td>TOTAL</td>
          </tr>
          {carrito.map(d =>
            <tr className="item" key={d.id}>
              <td>{d.cantidad}</td>
              <td>{d.nombre}</td>
              <td>{d.precio}</td>
              <td>{d.precio * d.cantidad}</td>
            </tr>)}
          <tr className="total">
            <td colSpan="3"></td>
            <td>Total: {total}</td>
          </tr>
        </table>
        <div className="terms">
          <p>PIE DE IMPRENTA</p>
          <p>Fecha de Imp. {fechaActual}</p>
          <p>N° 0001 - 00000051 al 00000100</p>
          <p>Original Blanco Duplicado Color</p>
        </div>
      </div>
      <div>
        <button className="btn btn-success" onClick={generatePDF}>Imprimir Factura</button> <br /> <br />
        <button className="btn btn-danger" onClick={handleVaciar} >Vaciar Carrito</button>
      </div></>
  );
};

const Productos = ({ onEditarProducto, searchTerm }) => {
  const { state, dispatch } = useProductos();
  const { productos } = state;

  const seleccionarProductoParaEditar = (producto) => {
    onEditarProducto(producto);
  };

  const agregarAlCarrito = (id) => {
    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: id });
  };

  const eliminarProducto = (id) => {
    dispatch({ type: 'ELIMINAR_PRODUCTO', payload: id });
  };

  // Filtra los productos según el término de búsqueda
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tabla-productos">
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">Nombre del Producto</th>
            <th scope="col">Unidades</th>
            <th scope="col">Precio</th>
            <th scope="col">Acciones</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.id}</th>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td>{p.precio}</td>
              <td>
                <i
                  className="fa-solid fa-cart-plus"
                  onClick={(e) => {
                    e.stopPropagation();
                    agregarAlCarrito(p.id);
                  }}
                ></i>
              </td>
              <td>
                <i
                  className="fa-regular fa-pen-to-square"
                  onClick={(e) => {
                    e.stopPropagation();
                    seleccionarProductoParaEditar(p);
                  }}
                ></i>
              </td>
              <td>
                <i
                  className="fa-solid fa-trash"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarProducto(p.id);
                  }}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};




const Form = ({ id, nombre, stock, precio, setVentana }) => {
  const { state, dispatch } = useProductos();
  const [nuevonombre, setNombre] = useState(nombre);
  const [unidades, setUnidades] = useState(stock);
  const [valor, setValor] = useState(precio);
  const [error, setError] = useState('');

  useEffect(() => {
    setNombre(nombre);
    setUnidades(stock);
    setValor(precio);
  }, [nombre, stock, precio]);

  const validarInputs = () => {
    if (!nuevonombre.trim()) {
      setError('El nombre del producto no puede estar vacío');
      return false;
    }
    if (unidades <= 0) {
      setError('Las unidades deben ser mayores que cero');
      return false;
    }
    if (valor <= 0) {
      setError('El precio debe ser mayor que cero');
      return false;
    }
    setError('');
    return true;
  };

  const editar = (e) => {
    e.preventDefault();
    if (!validarInputs()) {
      setAgregar(false);
      setHome(true);
      return;
    }

    const productosModificados = {
      id,
      nombre: nuevonombre,
      stock: unidades,
      precio: valor,
    };

    if (id !== null) {
      dispatch({ type: 'EDITAR_PRODUCTO', payload: productosModificados });
    } else {
      const maxID = state.productos.reduce((max, producto) => (producto.id > max ? producto.id : max), 0);
      const nuevoProducto = {
        ...productosModificados,
        id: maxID + 1,
      };

      dispatch({ type: 'AGREGAR_PRODUCTO', payload: nuevoProducto });
    }
    setVentana(false);
  };

  const cancelar = (e) => {
    e.preventDefault();
    setNombre(nombre);
    setUnidades(stock);
    setValor(precio);
    setVentana(false);
  };

  return (
    <form className="mb-3">
      <div className="mb-3">
        <label htmlFor="nombreProducto" className="form-label">Nombre del Producto</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nombre"
          value={nuevonombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="unidades" className="form-label">Unidades</label>
        <input
          type="number"
          className="form-control"
          placeholder="Unidades"
          value={unidades}
          onChange={(e) => setUnidades(Number(e.target.value))}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="precio" className="form-label">Precio</label>
        <input
          type="number"
          className="form-control"
          placeholder="Precio"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
        />
      </div>
      {error && <p className="text-danger">{error}</p>}
      <button className="btn btn-primary me-2" onClick={editar}>Aceptar</button>
      <button className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
    </form>
  );
};



function App() {
  const [agregar, setAgregar] = useState(false);
  const [home, setHome] = useState(true);
  const [ventanaCarrito, setVentanaCarrito] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  const productosVacios = {
    id: null,
    nombre: '',
    stock: 0,
    precio: 0,
  };

  const handleAgregarProducto = () => {
    setProductoSeleccionado(productosVacios);
    setAgregar(true);
    setHome(false);
    setVentanaCarrito(false);
  };

  const handleEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setAgregar(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <ProductosProvider>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid"></div>
      </nav>
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <form className="d-flex" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar"
              aria-label="Search"
              value={searchTerm} // Valor del input controlado
              onChange={handleSearchChange} // Manejador del cambio del input
            />
          </form>
          <a className="navbar-brand" href="#">
            Super-VacasFood
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Lugares
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    aria-current="page"
                    href="#"
                    onClick={() => {
                      setHome(true);
                      setAgregar(false);
                      setVentanaCarrito(false);
                    }}
                  >
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={() => {
                      setVentanaCarrito(true);
                      setHome(false);
                      setAgregar(false);
                    }}
                  >
                    Carrito
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Acciones
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleAgregarProducto}
                      >
                        Agregar Productos
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav><br />
      {agregar ? (
        <Form {...productoSeleccionado} setVentana={setAgregar} />
      ) : home ? (
        <Productos onEditarProducto={handleEditarProducto} searchTerm={searchTerm} />
      ) : ventanaCarrito ? (
        <Carrito />
      ) : null}
    </ProductosProvider>
  );
}