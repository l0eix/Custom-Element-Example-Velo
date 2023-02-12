import { warning, success } from 'public/colors.json';

const createStyle = () => {
    //Creating style tags and adding CSS to our custom html element.
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
    * {
    font-family: Poppins;
}

p {
    padding: 0;
    margin: 0;
    font-size: 16px;
}

.grid {
    display: grid;
    width: 875px;
    grid-template-columns: 1fr;
    grid-row-gap: 2em;
    justify-items: center;
    align-items: center;
}

.orderTab {
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-auto-rows: minmax(100px, auto);
}

.productDetails {
    display: grid;
    grid-template-columns: 1fr 8fr;
    align-items: center;
    justify-items: start;
}

.productImage {
    margin-right: 20px;
    align-items: center;
}

.productImageFit {
    border-radius: 12px;
    object-fit: cover;
}

.productTexts {
    display: grid;
    grid-template-columns: 1fr;
    align-self: start;
}

.greyText {
    color: #828282;
}

.productName {
    max-width: 350px;
    min-height: 50px;
    margin-bottom: 10px;
}

.productDownload {
    display: grid;
    grid-template-columns: 1fr;
}

.productQuantity {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.price {
    justify-self: end;
}

.downloadProduct {
    justify-self: right;
    align-self: end;
    margin-bottom: 10px;
}

.downloadButton {
    width: 220px;
    height: 40px;
    border: 0px;
    background: #bf0033;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    transition: 0.3s;
}

.downloadButton:hover {
    cursor: pointer;
    opacity: 70%;
}

#productInfo {
    display: none;
    flex-direction: column;
    align-items: left;
    margin-top: 10px;
    height: max-content;
    background-color: #ffe076;
    border-radius: 12px;
}

.productInfoText {
    color: #231b00;
    padding: 12px 20px 10px 20px;
}

.checkUpdatesButton {
    background-color: transparent;
    border: none;
    color: #231b00;
    font-size: 16px;
    padding: 0px 20px 12px 20px;
}

.checkUpdatesButton:hover {
    cursor: pointer;
    text-decoration: underline;
}
  `;
    return styleElement;
};

let innerHtml = () => {
    let html = `
<div class="orderTab">
            <div class="productDetails">
                <div class="productImage">
                    <img class="productImageFit" id="productImage" width="160px" height="100px" alt="">
                </div>
                <div class="productTexts">
                    <p id="productName" class="productName">Yayıncı Paketi</p>
                    <p id="productSku" class="greyText">Ürün Kodu: yayıncı-paketi-v1.09</p>
                    <p id="productPrice" class="greyText">Fiyatı: 174.99₺</p>
                </div>
            </div>
            <div class="productDownload">
                <div class="productQuantity">
                    <p id="productQuantity">Adet: 1</p>
                    <p id="productPriceTwo" class="price">Fiyat: 174.99₺</p>
                </div>
                <div class="downloadProduct">
                    <a target="_blank" id="downloadProduct"><button id="donwloadButton" class="downloadButton">Son Sürümü İndir</button></a>
                </div>
            </div>
        </div>
        <div class="productInfo" id="productInfo">
                <p class="productInfoText" id="productInfoText"></p>
                <a id="checkUpdates" target="_blank" href="">
                    <button class="checkUpdatesButton"> Son Güncelleme Notlarına Göz At</button>
                </a>
            </div>
`;
    return html;
}

//Creating grid to align other grids (main grid).
const createGrid = () => {
    const grid = document.createElement('div');
    grid.className = "grid";
    return grid;
}

//Creating custom ordertab element and passing every data that we took from attributes coming from Velo (backend -> frontend -> attribute -> here)
const createOrderTab = async (data) => {
    const orderTab = document.createElement('div');
    orderTab.innerHTML = innerHtml();
    orderTab.querySelector(`#productImage`).src = `https://static.wixstatic.com/media/${data.productImage}`;
    orderTab.querySelector(`#productName`).innerText = data.productName;
    orderTab.querySelector(`#productSku`).innerText = `Ürün Kodu: ${data.productSku}`;
    orderTab.querySelector(`#productPrice`).innerText = "Fiyat: " + data.productPrice + "₺";
    orderTab.querySelector(`#productQuantity`).innerText = `Adet: ${data.productQuantity}`;
    orderTab.querySelector(`#productPriceTwo`).innerText = data.productPrice + "₺";

    if (data.productId != undefined) {
        orderTab.querySelector(`#donwloadButton`).addEventListener('click', event => {
            main.dispatchEvent(new CustomEvent('onClick', { detail: { productId: data.productId, orderId: data.orderId } }));
        })
    } else {
        orderTab.querySelector(`#donwloadButton`).placeholder = 'İndirme Devre Dışı';
    }

    return orderTab;
}

const statusColorGenerator = async (state, updateStatusAttribute, orderId) => {
    const isProductUpdateable = updateStatusAttribute.filter((a) => {
        return a.orderId === orderId;
    })[0];

    if (isProductUpdateable.answer === true) {
        //hasUpdates, alreadyUpdated, firstTime these are the status data
        const updateStatus = isProductUpdateable.updateStatus;
        const isBeta = await updateStatus.betaStatus === true ? ' (Bu sürüm bir BETA sürümdür!)' : '';

        if (updateStatus.status === 'firstTime') {
            state.shadowRoot.querySelector(`#productInfo`).style.backgroundColor = warning['90'];
            state.shadowRoot.querySelector(`#productInfoText`).style.color = warning['10'];
            state.shadowRoot.querySelector(`#productInfoText`).innerText = `Güncelleme Durumu: ${updateStatus.latestVersion} sürümüne güncelleme mevcut! ${isBeta}`;
            //state.shadowRoot.querySelector(`#checkUpdates`).href = updateStatus['link-products-productKey'];
        } else if (updateStatus.status === 'hasUpdates') {
            state.shadowRoot.querySelector(`#productInfo`).style.backgroundColor = warning['90'];
            state.shadowRoot.querySelector(`#productInfoText`).style.color = warning['10'];
            state.shadowRoot.querySelector(`#productInfoText`).innerText = `Güncelleme Durumu: ${updateStatus.latestVersion} sürümüne güncelleme mevcut!${isBeta}. En son indirdiğiniz sürüm ${updateStatus.lastestDownloadedVersion || '?'} sürümüydü.`;
            //state.shadowRoot.querySelector(`#checkUpdates`).href = updateStatus['link-products-productKey'];
        } else if (updateStatus.status === 'alreadyUpdated') {
            state.shadowRoot.querySelector(`#productInfo`).style.backgroundColor = success['90'];
            state.shadowRoot.querySelector(`#productInfoText`).style.color = success['10'];
            state.shadowRoot.querySelector(`#productInfoText`).innerText = `Güncelleme Durumu: Paketiniz zaten en son sürüme güncellenmiş durumda!`;
            // state.shadowRoot.querySelector(`#checkUpdates`).href = updateStatus['link-products-productKey'];
        }

        state.shadowRoot.querySelector(`#productInfo`).style.display = 'flex';
        return;
    } else {
        if (state.shadowRoot.querySelector(`#productInfo`)) {
            state.shadowRoot.querySelector(`#productInfo`).style.display = 'none';
        }
        return;
    }
}

let main;

class OrderTab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        //Adding one time elements to our custom elementasa a child.
        main = this;
    }

    static get observedAttributes() {
        //Adding attributes that we want to listen.
        return ['data'];
    }

    //Handle attribute changes
    async attributeChangedCallback(name, oldValue, newValue) {
        //Check attribute name
        if (name === 'data') {
            await this.shadowRoot.appendChild(await createStyle());
            await this.shadowRoot.appendChild(await createGrid());

            //Get attribute data
            const data = await JSON.parse(this.getAttribute(`data`));
            console.log("Incoming Data: ", data);

            const updateStatus = await JSON.parse(this.getAttribute('updateStatus'));

            //I have used vanilla js so this is why we use forEach here :)
            //You can use React, Vue.js or other frameworks to create better and dynamic UI/UX :)
            data.forEach(async (product) => {
                this.shadowRoot.querySelector('.grid').appendChild(await createOrderTab(product))
                statusColorGenerator(this, updateStatus, product.orderId);
            })
        }
    }

    async connectedCallback() {
        //Listening connected
    }

    disconnectedCallback() {
        //Listening disconnects
    }
}

//Define custom element to use
window.customElements.define('order-tab', OrderTab);