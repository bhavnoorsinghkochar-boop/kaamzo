
path = 'src/components/worker/WorkerApp.tsx'
with open(path, 'r') as f:
    content = f.read()

target = 'href={}'
replacement = 'href={} target="_blank" rel="noreferrer"'

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('NOT FOUND')
