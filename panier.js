// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', loadProductsFromCart());

// TODO: Déclarer la variable total pour stocker le montant total du panier

var products = [];


// ================ initialise et ouvre la connexion à la base de données IndexedDB ================
/**
 * Ouvre ou crée la base de données IndexedDB
 * return La requête d'ouverture de la base de données
 */
function openDB() {
    // TODO: Implémenter l'ouverture de la base de données
    // 1. Créer une requête d'ouverture de la base "CoffeeShopDB" version 1
    // 2. Gérer l'événement onupgradeneeded pour créer:
    //    - Un objectStore "products" avec keyPath "id"
    //    - Un objectStore "cart" avec keyPath "id"
    // 3. Retourner la requête
    const dbRequest = indexedDB.open("CoffeeShopDB",1);
    dbRequest.onupgradeneeded = (event) =>{
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


// ================ CHARGEMENT DU PANIER ================
/**
 * Charge les produits du panier depuis IndexedDB et les affiche
 */
function loadProductsFromCart() {
    // TODO: Implémenter le chargement des produits du panier
    // 1. Ouvrir la connexion avec openDB()
    // 2. Dans onsuccess:
    //    - Créer une transaction en "readonly" sur "cart"
    //    - Obtenir l'objectStore
    //    - Utiliser getAll() pour récupérer tous les produits
    //    - Appeler displayCartItem avec les produits récupérés
    // 3. Gérer les erreurs avec onerror
    const dbRequest = openDB();
    dbRequest.onsuccess = () =>{
        var db = dbRequest.result;
        var tx = db.transaction("cart","readonly");
        var store = tx.objectStore("cart");
        var getcart = store.getAll();
        getcart.onsuccess = () =>{
            const produit = getcart.result;
            displayCartItem(produit);
        }
        dbRequest.onerror = (event) => {
            console.log("ERREUR !!");
        } 
    }
}

// ================ AFFICHAGE DU PANIER ================
/**
 * Affiche les produits du panier dans l'interface
 */
function displayCartItem(pr) {
    // TODO: Implémenter l'affichage des produits du panier
    // 1. Réinitialiser le total à 0
    // 2. Récupérer le conteneur du panier, utiliser getElementById()
    // 3. Vider le conteneur
    // 4. Pour chaque produit:
    //    - Créer une ligne avec createCartItemRow
    //    - L'ajouter au conteneur
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Vider le contenu actuel
    pr.forEach(product => {
        cartContainer.appendChild(createCartItemRow(product));
    });
    updateTotal();

}


/**
 * Crée une ligne pour un produit dans le panier
 * param {Object} item - Le produit à afficher
 * return {HTMLElement} La ligne créée
 */

function createCartItemRow(item) {
    // TODO: Implémenter la création d'une ligne de produit
    // 1. Cloner le template 'cart-item-template'
    // 2. Remplir les données (image, nom, prix, quantité, total)
    // 3. Calculer et mettre à jour le total général
    // 4. Ajouter les événements:
    //    - Bouton diminuer: updateQuantity(id, quantity - 1)
    //    - Bouton augmenter: updateQuantity(id, quantity + 1)
    //    - Bouton supprimer: removeFromCart(id)
    // 5. Retourner la ligne créée

    const template = document.getElementById('cart-item-template');
    const clone = template.content.cloneNode(true);
    // Remplir les données
    const row = clone.querySelector('.cart-item');
    const img = row.querySelector('img');
    const name = row.querySelector('.product-name');
    const price = row.querySelector('.product-price');
    const quantity = row.querySelector('.quantity');
    const itemTotal = row.querySelector('.item-total');
   
    // Mettre les données du produit
    img.src = item.image_url;
    name.textContent = item.name;
    price.textContent = `${item.price.toFixed(2)} DH`;
    quantity.textContent = item.quantity;
    itemTotal.textContent = `${(item.price * item.quantity).toFixed(2)} `;
    // Ajouter les événements
    row.querySelector('.decrease').addEventListener('click', () => updateQuantity(item.id, item.quantity - 1));
    row.querySelector('.increase').addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));
    row.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.id));

    return row;
}
// ================ GESTION DES PRODUITS DU PANIER ================
/**
 * Met à jour la quantité d'un produit dans le panier
 * param {string} productId - ID du produit à modifier
 * param {number} newQuantity - Nouvelle quantité
 */
function updateQuantity(productId, newQuantity) {
    // TODO: Implémenter la mise à jour de la quantité
    // 1. Vérifier que la nouvelle quantité n'est pas 0
    // 2. Ouvrir une connexion a l'aide de openDB()
    // 3. Dans onsuccess:
    //    - Créer une transaction en "readwrite" sur "cart"
    //    - Récupérer le produit actuel
    //    - Mettre à jour sa quantité
    //    - Sauvegarder les changements
    //    - Recharger l'affichage du panier

   


     // 1. Vérifier que la nouvelle quantité n'est pas 0
    if(newQuantity == 0){
        removeFromCart(productId);
        return;
    }
    // 2. Ouvrir une connexion a l'aide de openDB()
    var dbRequest = openDB();
    // 3. Dans onsuccess:
    dbRequest.onsuccess = () => {
        var db = dbRequest.result;
        var tx = db.transaction("cart","readwrite");
        var store = tx.objectStore("cart");

         //    - Récupérer le produit actuel
        var itemReq = store.get(productId);
       
        itemReq.onsuccess = () => {
        //    - Mettre à jour sa quantité
            const item = itemReq.result;
            item.quantity = newQuantity;
            store.put(item);
        }
        tx.oncomplete = () => {
            loadProductsFromCart();  //- Recharger l'affichage du panier
            updateTotal();
        };
    };
}

/**
 * Supprime un produit du panier
 * param {string} productId - ID du produit à supprimer
 */
function removeFromCart(productId) {
    // TODO: Implémenter la suppression du panier
    // 1. Ouvrir une connexion via OpenDB()
    // 2. Dans onsuccess:
    //    - Créer une transaction en "readwrite" sur "cart"
    //    - Supprimer le produit avec store.delete()
    //    - Recharger l'affichage du panier
    // 3. Gérer les erreurs
    var dbRequest = openDB();
    dbRequest.onsuccess = () =>{
        var db = dbRequest.result;
        var tx = db.transaction("cart","readwrite");
        var store = tx.objectStore("cart");
        store.delete(productId);
        tx.oncomplete = () =>{
            loadProductsFromCart();
            updateTotal();
        }
    }
}
function updateTotal() {
    // Ouvrir la connexion à la base de données
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction("cart", "readonly");
        const store = tx.objectStore("cart");

        // Récupérer tous les produits du panier
        const getAllRequest = store.getAll();
        let total = 0;
        getAllRequest.onsuccess = () => {
            const products = getAllRequest.result;
           

            // Calculer le total
            products.forEach(product => {
                total += product.price * product.quantity;
            });

            // Mettre à jour l'élément HTML
            
            
        };
        tx.oncomplete = () =>{
            const totalAmountElement = document.getElementById("total-amount");
            if (totalAmountElement) {
                totalAmountElement.textContent = total.toFixed(2);
            }
        };
    }
}




