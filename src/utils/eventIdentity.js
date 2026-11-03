export function getEventId(event) {
    return event?._id ?? event?.id
}
