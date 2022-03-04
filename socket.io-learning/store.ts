export interface Store {
  findUser(name: string): string;
  addUser(id: string, name: string): void;
  getNumOfUsers(): number;
  purge(): void;
}

export class MemoryStoreImpl implements Store {
  private users: Map<string, string>;
  private lookupUsers: Map<string, string>;
  private numOfUsers: number;

  constructor() {
    this.users = new Map();
    this.lookupUsers = new Map();
    this.numOfUsers = 0;
  }

  addUser(id: string, name: string) {
    if (this.users.has(name)) {
      throw new Error("Oops! sorry user already exists");
    } else {
      this.users.set(id, name);
      this.lookupUsers.set(id, name);
      this.numOfUsers++;
    }
  }

  getNumOfUsers(): number {
    return this.numOfUsers;
  }

  findUser(name: string): string {
    return this.lookupUsers.get(name) ?? "";
  }

  purge() {
    this.users.clear();
    this.lookupUsers.clear();
    this.numOfUsers = 0;
  }
}
