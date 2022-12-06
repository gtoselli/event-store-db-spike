import { Event, IEventStore } from '@golee/cqrs-es-toolkit';
import { EventStoreDBClient, FORWARDS, jsonEvent, ResolvedEvent, START } from '@eventstore/db-client';

export class EventStore implements IEventStore {
    private client: EventStoreDBClient;

    constructor(private readonly domainEvents: Map<string, Event<unknown>>) {
        this.client = new EventStoreDBClient(
            {
                endpoint: 'localhost:2113',
            },
            { insecure: true },
        );
    }

    public async getEventsForAggregate(aggregate_id: string): Promise<Event<unknown>[]> {
        const streamName = aggregate_id;
        let jsonEvents: ResolvedEvent[] = [];

        const eventsStream = this.client.readStream(streamName, {
            direction: FORWARDS,
            fromRevision: START,
        });
        for await (const resolvedEvent of eventsStream) {
            jsonEvents = [...jsonEvents, resolvedEvent];
        }
        console.log(`Found ${jsonEvents.length} events for aggregate ${aggregate_id}`);

        return jsonEvents.map((rawEvent) => {
            // TODO: bad solution
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const event = new (this.domainEvents.get(rawEvent.event.type)!)(
                rawEvent.event.streamId,
                (rawEvent.event.data as any).eventPayload,
            );
            event.setEventId(rawEvent.event.id);
            // event.setAggregateVersion(rawEvent.event.s); //TODO
            return event;
        });
    }

    public async saveEvents(aggregate_id: string, events: Event<unknown>[]): Promise<void> {
        const streamName = aggregate_id;
        const jsonEvents = events.map((event) =>
            jsonEvent({
                data: JSON.parse(JSON.stringify(event)),
                type: event.eventName,
            }),
        );
        const appendResult = await this.client.appendToStream(streamName, jsonEvents);
        console.log({ appendResult });
    }
}
