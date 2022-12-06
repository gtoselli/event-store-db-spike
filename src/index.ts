import { EventStore } from './event-store';
import { CurrentSnapshotRepo, EsRepo, PragmaticRepo } from '@golee/cqrs-es-toolkit';
import { eventsMap } from './domain/events';
import { CartAggregate } from './domain/Cart.aggregate';
import { connect } from 'mongoose';
import { v4 as uuid } from 'uuid';

const main = async () => {
    // Mongo connection
    const mongo = await connect('mongodb://root:example@localhost:27017');

    // Pragmatic repo deps
    const eventStore = new EventStore(eventsMap);
    const esRepo = new EsRepo(eventStore, CartAggregate);
    const currentSnapshotRepo = new CurrentSnapshotRepo(mongo.connection, CartAggregate);
    const pragmaticRepo = new PragmaticRepo<CartAggregate>(esRepo, currentSnapshotRepo);

    // Append test
    const cartId = uuid();
    const cart = new CartAggregate(cartId);
    cart.create();
    cart.addItem('foo-item-id', 'foo-item-name');
    await pragmaticRepo.commitAndSave(cart);

    // Retrieve test
    console.log(await pragmaticRepo.getByIdFromEs(cartId));
};

main().catch(console.error);
