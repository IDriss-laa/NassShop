// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', getProducts());

// TODO: Déclarer la variable globale pour stocker les produits
var products = [];


// ================ initialise et ouvre la connexion à la base de données IndexedDB ================
/**
 * Ouvre ou crée la base de données IndexedDB
 * return La requête d'ouverture de la base de données
 */

function openDB() {
    // TODO: Implémenter l'ouverture de la base de données
    // 1. Utilisez indexedDB.open avec le nom "CoffeeShopDB" et la version 1
    // 2. Gérez l'événement onupgradeneeded pour créer les objectStores si nécessaire
    // - Un objectStore "products" avec keyPath "id"
    // - Un objectStore "cart" avec keyPath "id"
    const dbRequest = indexedDB.open("CoffeeShopDB", 1);
    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };
    return dbRequest;
}


async function getProducts() {
    fetch('https://fake-coffee-api.vercel.app/api')
        .then(response => {  return response.json();  })
        .then(data => {
            // Stockage dans la variable globale
            products = data;
            // Appeler addProductsToDB pour sauvegarder en local
            
            addProductsToDB(products);

            // Affichage des produits
            displayProducts(products);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits:", error);
            // En cas d'erreur, appeler loadProductsFromDB
            loadProductsFromDB();
        });
}


// Fonction qui stocke les produits dans IndexedDB
function addProductsToDB(products) {
    // TODO: Implémenter le stockage dans IndexedDB
    // 1. Ouvrir la connexion avec openDB()
    // 2. En cas de succès de l'ouverture:
    //    - Créer une transaction en "readwrite" sur "products"
    //    - Obtenir l'objectStore
    //    - Stocker chaque produit avec store.put()
    // 3. Gérer les erreurs avec onerror
    

    // 1. Ouvrir la connexion avec openDB()
        
    // 2. En cas de succès de l'ouverture
    var dbRequest = openDB();
    dbRequest.onsuccess = () => {
        var db= dbRequest.result;
        var tx= db.transaction("products", "readwrite");
        var store = tx.objectStore("products");


        
        // Stocker chaque produit
        products.forEach(product => {
            store.put(product);
        });

        tx.oncomplete = () => {
            console.log("Produits stockés avec succès");
        };
    };

    // 3. Gérer les erreurs
    dbRequest.onerror = (event) => {
        console.log("ERREUR avec le stockage des produits!!");
    };
}


// Fonction pour charger les produits depuis IndexedDB
function loadProductsFromDB() {
    // TODO: Implémenter le chargement depuis IndexedDB
    // 1. Ouvrir la connexion avec openDB()
    // 2. Dans onsuccess:
    //    - Créer une transaction en "readonly" sur "products"
    //    - Obtenir l'objectStore
    //    - Utiliser getAll() pour récupérer tous les produits
    //    - Mettre à jour la variable globale products
    //    - Appeler displayProducts
    
    
    // 1. Ouvrir la connexion avec openDB()
    var dbRequest = openDB();
    
    
    // 2. En cas de succès de l'ouverture
    dbRequest.onsuccess = () => {
        var db= dbRequest.result;
        var tx= db.transaction("products", "readonly");
        var store = tx.objectStore("products");
        var req = store.getAll();
            req.onsuccess = () => {       
                // utiliser l'événement onsuccess de la requête
                // utiliser request.result
                // Afficher les produits a l'aide de displayProducts()
                products = req.result;
                console.log("req.resultat",req.result);
                displayProducts(products);
            };

            transaction.oncomplete = () => {
                console.log("load products from db");
            };
        };
    
        // 4. Gérer les erreurs
        dbRequest.onerror = (event) => {
            console.log("ERREUR !!");
        };
    }

// Fonction simple pour ajouter un produit au panier
function addToCart(productId) {
    // TODO: Implémenter l'ajout au panier
    // 1. Ouvrir la connexion avec openDB()
    // 2. Dans onsuccess:
    //    - Créer une transaction en "readwrite" sur "cart"
    //    - Trouver le produit correspondant dans la variable globale products
    //    - Créer un objet cartItem avec les propriétés nécessaires
    //    - Stocker l'item dans l'objectStore "cart"



    //Ouvrir la connexion avec openDB()
    var dbReq = openDB();
    
    // 2. Dans onsuccess:
    dbReq.onsuccess = () => {
        var dbcart = dbReq.result;
        var tx = dbcart.transaction("cart", "readwrite");
        var store = tx.objectStore("cart");


            //    - Trouver le produit correspondant dans la variable globale products
            let product_detail= products.find(p => p.id == productId);

            // Créer l'objet à stocker dans le panier
            const cartItem = {
                id: productId,
                image_url:product_detail.image_url,
                name:product_detail.name,
                price: product_detail.price,
                quantity: 1
            };
            
            // Ajouter au panier
            store.put(cartItem);
            
            tx.oncomplete = () => {
                console.log("Produit ajouté au panier");
            };
        
    };
    
    dbReq.onerror = () => {
        console.error("Erreur d'ajout au panier");
    };
}



//------------------------------------------------------- Code TP 2 ----------------------------------------------------------

// Créer une carte de produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.title}"  >
        <h3>${product.name}</h3>
        <div class="product-info">
        <h4 class="price">${product.price}dh </h4>
        <p class="description">${product.description}</p>
        <button onclick="addToCart('${product.id}')" class="add-to-cart">+</button>
        </div>
    `;
    return card;
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.querySelector('.product-content');
    grid.innerHTML = '';
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}


// Mode view
const container = document.querySelector('.product-content');
const gridIcon = document.getElementById('grid');
const listIcon = document.getElementById('list');
// Fonction pour passer en vue grille
function setGridView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    container.style.justifyContent = 'flex-start';
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.maxWidth = '300px';
    });


}

// Fonction pour passer en vue liste
function setListView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    
    document.querySelectorAll('.product-card').forEach(card => {
        
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.maxWidth = '100%';
        card.style.alignItems = 'center';
        card.style.gap = '20px';
    });
    // let cards = document.querySelectorAll('.product-card');
    // for (i=0;i<cards.length;i++){
    //     cards[i].style.display = 'flex';
    //     cards[i].style.flexDirection = 'row';
    //     cards[i].style.maxWidth = '100%';
    //     cards[i].style.alignItems = 'center';
    //     cards[i].style.gap = '20px';
    // }


    // document.querySelectorAll('.product-card img ').forEach(img => {
    //     img.style.maxWidth="200px";
    // });

    let imgs = document.querySelectorAll('.product-card img ');
    for(i=0;i<imgs.length;i++){
        imgs[i].style.maxWidth = "200px";
    }
    
    let btns = document.querySelectorAll('.product-card button');
    for(i=0;i<btns.length;i++){
        btns[i].style.alignSelf = "flex-end";
    }
    // document.querySelectorAll('.product-card button').forEach(btn => {
    //     btn.style.alignSelf  = 'flex-end';
    // });

}

// Ajouter les écouteurs d'événements aux icônes
gridIcon.addEventListener('click', setGridView);
listIcon.addEventListener('click', setListView);

// Initialiser la vue par défaut (grille)
setGridView();




// Fonction pour filtrer les produits
function filterProducts() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    displayProducts(filteredProducts);
}

// Écouteur d'événement pour le champ de recherche
document.getElementById('search-input').addEventListener('input', filterProducts);




