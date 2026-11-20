import EventCard from "./EventCard";
import Reveal from '../common/Reveal'
import { getEventId } from '../../utils/eventIdentity'

function EventGrid({events}) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index)=>(
                <Reveal key={getEventId(event)} delay={Math.min(index, 8) * 70}>
                    <EventCard event={event} />
                </Reveal>
            ))}
        </div>
    )
}

export default EventGrid