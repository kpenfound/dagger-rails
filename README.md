# dagger-rails
A dagger extension for rails operations

## Supported Commands
- Anything rails can do!

## TODO
- TODO

## Example
```gql
{
  host {
    workdir {
      read {
        rails(runArgs: ["test:all"]) {
          id
        }
      }
    }
  }
}
```
