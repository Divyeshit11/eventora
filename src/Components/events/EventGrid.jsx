import EventCard from "./EventCard";

function EventGrid({events}) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event)=>(
                <EventCard 
                key={event.id}
                event={event}
                />
            ))}
        </div>
    )
}

export default EventGrid