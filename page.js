//No docs needed only comments - 1 May 2022 

import { getOrders, getDownloadStatusForMember } from 'backend/Member-Pages/my-orders.jsw';
import { getInvoice } from 'backend/Helpers/billing-helpers.jsw';
import { getMemberId } from 'backend/Helpers/member-helpers.jsw';
import { formFactor } from 'wix-window';
import { getClientIp } from 'public/Utilities/ip-handlers.js'
import { checkProductStatus } from 'public/Utilities/wix-data-utils.js';
import moment from 'moment';

$w.onReady(function () {
    moment.locale('tr');
    if (formFactor === "Desktop") {
        initPage();
    }
});

let clientIp;
let memberOrders;

const pageData = {
    memberId: undefined
}

async function initPage() {
    clientIp = await getClientIp(); //get user IP address
    pageData.memberId = await getMemberId(); //get member ID
    memberOrders = await getOrders().catch(err => { throw new Error(`ExWeiv-ERROR S31-M Error when trying to get member orders: ${err}`); }); //get member orders
    ordersRepeater();
}

async function ordersRepeater() {
    $w("#myOrdersRepeater").data = await memberOrders;

    $w('#preloader').collapse(); //close preloader
    $w("#myOrdersRepeater").expand(); //show orders

    $w("#myOrdersRepeater").onItemReady(async ($item, itemData, index) => {
        //Setting attributes for custom element and using a method to identify every exported data to the custom element.
        //Otherwise all custom elements will be showing same product.

        const products = await itemData.lineItems.map((lineItem) => {
            return {
                ...lineItem,
                "orderId": itemData._id,
            }
        })

        const isProductUpdateable = await checkProductStatus(products);
        //SEND DATA TO CUSTOM ELEMENT USING - setAttribute()
        $item('#orderLineItems').setAttribute('updateStatus', JSON.stringify(isProductUpdateable))
        $item("#orderLineItems").setAttribute(`data`, JSON.stringify(products)); //send data
        $item("#orderLineItems").expand(); //show products in the order 

        $item("#orderLineItems").on('onClick', (event) => {
            const { detail } = event;
            //Open URL in new window using embed HTML and postMessage callback with it
            $w("#htmlElement").postMessage(`https://www.exweiv.store/api/downloadProduct?orderId=${detail.orderId}&productId=${detail.productId}&memberId=${pageData.memberId}&ip=${clientIp}`);
        })

        $item("#orderDate").text = moment(itemData.orderDate).format('D MMM YYYY');
        $item("#orderId").text = `#${itemData.orderNo}`;
        $item("#orderTotal").text = `${itemData.totals.total.toFixed(2)}₺`;
        $item("#showInvoice").target = "_blank";

        $item("#expandDetails").onClick(async () => {
            if ($item("#orderDetailsBox").collapsed === true) {
                $item("#orderDetailsBox").expand();
                $item("#expandDetails").src = 'wix:vector://v1/510eca_bfe796a0d2f64e158041c53309733b5a.svg/daha az göster.svg';

                if ($item("#showInvoice").link) {
                    //
                } else {
                    const url = await getInvoice(itemData._id).catch(err => { throw new Error(`ExWeiv-ERROR S147-M Error when trying to get invoice of order: ${err}`) })
                    $item("#showInvoice").label = "Faturayı Görüntüle";
                    $item("#showInvoice").link = url;
                }
            } else {
                $item("#orderDetailsBox").collapse();
                $item("#expandDetails").src = 'wix:vector://v1/510eca_04bea23cf17b4f59b7d6080728be464f.svg/daha fazla göster.svg';
            }
        })

        $item("#productTotalPrice").text = `${itemData.totals.subtotal.toFixed(2)}₺`
        $item("#deliveryPrice").text = `${itemData.totals.shipping.toFixed(2)}₺`
        $item("#taxPrice").text = `${itemData.totals.tax.toFixed(2)}₺`
        $item("#totalPrice").text = `${itemData.totals.total.toFixed(2)}₺`
        $item("#discountAmount").text = `-${itemData.totals.discount.toFixed(2)}₺`

        if (itemData.paymentMethod === "Stripe") {
            $item("#paidWith").text = "Kartla ödendi."
        } else {
            $item("#paidWith").text = "Ödeme yöntemi bilinmiyor."
        }

        $item("#memberAddress").text = itemData.formattedAddress.replace("\n", " ");
    })
}