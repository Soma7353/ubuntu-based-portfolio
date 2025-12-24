# Web simulation of UbuntuOS

This is a personal portfolio website of theme Ubuntu 20.04, made using Next.js & tailwind CSS.
If you want to edit this. Clone this project and edit the files in `/src/components`.

To run this on localhost
type `npm start` and when u are done coding type `npm run build` to build your app.

_NOTE: if you have yarn just replace `npm start` and `npm run build` with `yarn start` and `yarn build`._

<a href="https://www.buymeacoffee.com/vivek9patel" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 140px !important;" ></a>

### To make the contact form work

1. **Create an EmailJS account:**
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Create a new Outlook or Gmail account to send emails through EmailJS

2. **Set up EmailJS service:**
   - Create a new service in EmailJS dashboard
   - Select and log in to your email account
   - Copy your **Service ID** from the dashboard
   - Copy your **User ID** (Public Key) from the dashboard

3. **Create email template:**
   - Create a new email template in EmailJS
   - Use variables: `{{name}}`, `{{subject}}`, `{{message}}`
   - Copy your **Template ID**

4. **Add credentials securely:**
   - Copy `env.example` file to `.env.local` in the root folder
   - Open `.env.local` and replace the placeholder values:
     ```
     NEXT_PUBLIC_USER_ID=your_actual_user_id_here
     NEXT_PUBLIC_SERVICE_ID=your_actual_service_id_here
     NEXT_PUBLIC_TEMPLATE_ID=your_actual_template_id_here
     ```
   - **Important:** `.env.local` is already in `.gitignore` - it will NOT be committed to git
   - Never share your `.env.local` file or commit it to version control

5. **Restart your development server:**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` or `yarn dev` again
   - The contact form should now work!


### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributiors who wants to make this website better can make contribution,which will be **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Added some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
