//1
import { type NextPage } from "next";
import Head from "next/head";
//2
import { Header } from "../components/Header"
import { useSession } from "next-auth/react";
//import { api } from "~/utils/api";
//3
import { useState } from "react";
//4
import { api, type RouterOutputs } from "~/utils/api";
//notes
import { NoteEditor } from "~/components/NoteEditor";
import { NoteCard } from "~/components/NoteCard";


const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>NoteTaker</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header />
        <Content />
      </main>
    </>
  );
};

export default Home;

// 4 It's called router outputs and then we can create a type and from that we can say that we want the topic router,
//    we want the getAll because that's what's going to return us to the topics that comes in as an array.
//    ( If I do 'command + K' or 'command + I' we see that we have an array of topics,)
//    so I'm just going to grab the zero-th item off that even if there isn't a zero-th item, it's fine. It just a Type.
type Topic = RouterOutputs["topic"]["getAll"][0];


// 1) Content 컴포넌트 생성
const Content: React.FC = () =>{
  const { data: sessionData } = useSession();

  // 3 we'll use it down here to say that we have a side to topic.
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // 1-1) we don't have API yet, so let's bring that in, pop that up -> import { api} from "../utils/api";
  const { data: topics, refetch: refetchTopics} = api.topic.getAll.useQuery(
    undefined, 
    {
      enabled: sessionData?.user !== undefined,

      //3-1 
      onSuccess: (data) => {
        setSelectedTopic(selectedTopic ?? data[0] ?? null);
      }
    }
  );

  // 1-2) return that out as a JSON string. for 데이터 확보 여부 확인 
  // return <div>{JSON.stringify(topics)}</div>

  // 2) So we need to go and get a mutator for create so we can add an input that allows us to then call that create to create a topic.
  // 2-1) So first we bring in our use mutation for create topic,
  const createTopic = api.topic.create.useMutation({
    // 2-3) What we really want to do is we want to refresh whenever we create a new one, right?
    // So first thing we need to do is we need to say, well, when we do our create topic, if we are successful,
    onSuccess: ()=>{
      //refetchTopics();
      //-> But the typescript definition is again really tight and it says that refresh topic returns a promise and you aren't awaiting that.
      
      //So to avoid that we can just do void and that basically says cool just ignore the return type.
      void refetchTopics(); //자동 새로고침 
    }
  });
  
  // **update-01 토픽 삭제 기능 추가 
  const deleteTopic = api.topic.delete.useMutation({
    onSuccess: () => {
      void refetchTopics(); //자동 새로고침 
    },
  });



  // save for notes
  // N-1 So we're going to call note dot getAll and we'll map that data output to notes in the way of a refetch notes,
  const { data: notes, refetch: refetchNotes } = api.note.getAll.useQuery(
    {
      //and then we'll connect topic ID to the site to topic ID.
      topicId: selectedTopic?.id ?? "",
    },
    {
      //and we'll do our enabled things so that only if we have a user and we have a slide, a topic, are we going to run our get all pretty easy.
      enabled: sessionData?.user !== undefined && selectedTopic !== null,
    }
  );

  // N-2 And then once we have that, we can create createNote, which is our mutation that calls create 
  const createNote = api.note.create.useMutation({
    //and when it's successful, it calls refetch notes,
    onSuccess: () => {
      //just like create topic called refetch topic.
      void refetchNotes();
    },
  });

  // N-3
  const deleteNote = api.note.delete.useMutation({
    onSuccess: () => {
      void refetchNotes();
    },
  });


  // 2-2) and then we're going to start actually laying this thing out
  return (
    <div className="mx-5 mt-5 grid grid-cols-4 gap-2">
      <div className="px-2">
        <ul className="menu rounded-box w-56 bg-base-100 p-2">
          {topics?.map((topic) =>(
            <li key={topic.id}>
              <a href="#" onClick={(evt)=>{
                evt.preventDefault();
                setSelectedTopic(topic);
              }}>
                {topic.title}
              </a>
            </li>
          ))}
        </ul>
        <div className="divider"></div>
        <input type="text" placeholder="New topic" className="input-bordered input input-sm w-full" onKeyDown={(e)=>{
          if(e.key === "Enter"){
            createTopic.mutate({
              title:e.currentTarget.value,
            });
            e.currentTarget.value="";
          }
        }}/>
      </div>
      <div className="col-span-3">

        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl">{selectedTopic?.title}</a>
          </div>
          <div className="flex-none gap-2">
            <button className="btn btn-square btn-outline" onClick={() => void deleteTopic.mutate({id: selectedTopic?.id ?? ""})}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div>
          {notes?.map((note)=>(
            <div key={note.id} className="mt-5">
              <NoteCard note={note} onDelete={() => void deleteNote.mutate({id: note.id})} />
            </div>
          ))}
        </div>

        <NoteEditor onSave={({ title, content}) => {
          void createNote.mutate({
            title,
            content,
            topicId: selectedTopic?.id ?? "",
          });
        }}/>
      </div>
    </div>
  )
};