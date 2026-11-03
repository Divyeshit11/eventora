import EventCard from "./EventCard";
import { getEventId } from '../../utils/eventIdentity'

function EventGrid({events}) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event)=>(
                <EventCard 
                key={getEventId(event)}
                event={event}
                />
            ))}
        </div>
    )
}

export default EventGrid