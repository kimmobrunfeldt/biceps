// Copied from https://github.com/gregberge/react-merge-refs
// MIT License
// Copyright (c) 2020 Greg Bergé
export function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        const castedRef = ref as React.MutableRefObject<T | null>
        castedRef.current = value
      }
    })
  }
}
