import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { type RouterOutputs } from "~/utils/api";

// We're bringing in router outputs because we want 
//  to get the type of note because we're going to pass it a note and we want that to be strongly typed. 
//  So again, we are going to get the note, get all and get the zeroeth off of that to get the note type command K,
//  command I and that gives us our note again that tracks.
//  So when we change the Prisma schema, it automatically goes through all of it.
type Note = RouterOutputs["note"]["getAll"][0];

export const NoteCard = ({
    note, onDelete,
}:{
    note: Note;
    onDelete: () => void;
})=> {
    //Okay, now note card is going to be an expando contracto collapsible item. 
    //  So we're going to track that using you state and now it's adding some tasks.
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    return (
        <div className="card mt-5 border border-gray-200 bg-base-100 shadow-xl">
            <div className="card-body m-0 p-3">
                <div className={`collapse-arrow ${
                    isExpanded ? "collapse-open" :""
                } collapse`} onClick={()=> setIsExpanded(!isExpanded)}>
                    <div className="collapse-title text-xl font-bold">{note.title}</div>

                    <div className="collapse-content">
                        <article className="prose lg:prose-xl">
                            <ReactMarkdown>{note.content}</ReactMarkdown>
                        </article>
                    </div>

                    <div className="card-action mx-2 flex justify-end">
                        <button className="btn-warning btn-xs btn px-5" onClick={onDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};
