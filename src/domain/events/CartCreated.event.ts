import { PublicEvent } from '@golee/cqrs-es-toolkit';

export class CartCreatedEvent extends PublicEvent<void> {
    constructor(cartId: string) {
        super(CartCreatedEvent.name, cartId);
    }
}
