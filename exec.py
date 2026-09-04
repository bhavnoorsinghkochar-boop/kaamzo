path = 'src/components/customer/CustomerApp.tsx'
with open(path, 'r') as file:
    content = file.read()

old_str = 'mailto:bhavnoorsinghkochar@gmail.com'
new_str = 'https://mail.google.com/mail/?view=cm&fs=1&to=bhavnoorsinghkochar@gmail.com'

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(path, 'w') as file:
        file.write(content)
    print('UPDATED CUSTOMER')
else:
    print('NOT FOUND CUSTOMER')
