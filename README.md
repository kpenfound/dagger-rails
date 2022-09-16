# dagger-rails
A dagger extension for rails operations

## Supported Commands
- Anything rails can do!

## TODO
- TODO

## Include this in your cloak.yaml
```yaml
  - git:
      remote: git@github.com:kpenfound/dagger-rails.git
      ref: main
      path: cloak.yaml
```

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
