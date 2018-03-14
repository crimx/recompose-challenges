export type Diff<T extends string, U extends string> = ({[P in T]: P } &
  {[P in U]: never } & { [x: string]: never })[T]

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>

export type Override<Ti, To> = Omit<Ti & To, keyof To> & To
