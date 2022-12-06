import { PublicEvent } from '@golee/cqrs-es-toolkit';

interface IItemAddedToCartPayload {
    itemId: string;
    itemName: string;
}

export class ItemAddedToCartEvent extends PublicEvent<IItemAddedToCartPayload> {
    constructor(cartId: string, payload: IItemAddedToCartPayload) {
        super(ItemAddedToCartEvent.name, cartId, payload);
    }
}
