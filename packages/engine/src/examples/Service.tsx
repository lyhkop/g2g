import * as THREE from 'three'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

type Result = {
  flag: number
}

type Entity = {
  id: string,
  name: string,
}

interface EditorService {
  loadWorld(id: string): void
  getEntityList(): Entity[]
  createEntity(): Result;
  getSelectedEntity(): Entity;
  updateSelectedEntity(entity: Entity): Result;
  queryEntityByMouse(): Entity;
}

class Editor implements EditorService {
  _scene: THREE.Scene
  constructor() {
    this._scene = new THREE.Scene();
  }
  loadWorld(id: string): void {
    throw new Error('Method not implemented.');
  }
  queryEntityByMouse(): Entity {
    throw new Error('Method not implemented.');
  }
  getSelectedEntity(): Entity {
    throw new Error('Method not implemented.');
  }
  updateSelectedEntity(entity: Entity): Result {
    throw new Error('Method not implemented.');
  }
  createEntity(): Result {
    throw new Error('Method not implemented.');
  }
  getEntityList(): Entity[] {
    throw new Error('Method not implemented.');
  }
}

const editor: EditorService = new Editor()

const queryClient = new QueryClient();

function useEntityList() {
  return useQuery({
    queryKey: ["entity_list"],
    queryFn: async (): Promise<Array<Entity>> => {
      return editor.getEntityList()
    },
  });
}

const useCreateEntity = () => {
  return useMutation({
    mutationFn: () => {
      return new Promise((resolve, reject)=>{
        try {
          const result = editor.createEntity();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({ queryKey: ["entity_list"] });
    }
  })
}

function App() {
  const { isLoading, data } = useEntityList();
  const { mutate, mutateAsync } = useCreateEntity();
  return <div></div>;
}
