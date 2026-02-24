 "use client"

 import * as React from "react"

 const DROPDOWN_OPEN_EVENT = "admin:dropdown-open"

 type DropdownEvent = CustomEvent<{ id?: string }>

 export function useDropdownManager(isOpen: boolean, onClose: () => void) {
   const id = React.useId()
   const onCloseRef = React.useRef(onClose)

   React.useEffect(() => {
     onCloseRef.current = onClose
   }, [onClose])

   React.useEffect(() => {
     if (!isOpen) return
     window.dispatchEvent(new CustomEvent(DROPDOWN_OPEN_EVENT, { detail: { id } }))
   }, [id, isOpen])

   React.useEffect(() => {
     const handler = (event: Event) => {
       const dropdownEvent = event as DropdownEvent
       if (!dropdownEvent.detail?.id || dropdownEvent.detail.id === id) return
       onCloseRef.current()
     }

     window.addEventListener(DROPDOWN_OPEN_EVENT, handler as EventListener)
     return () => window.removeEventListener(DROPDOWN_OPEN_EVENT, handler as EventListener)
   }, [id])

   return id
 }
