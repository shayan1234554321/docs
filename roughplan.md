we neeed to create a plan to create a google docs clone. it would have the following stuff but only create a very detailed plan in plan.md

pages
1. Just a very simple landing page with only one section.
on landing page header, we should have login/signup button. On click, it should open a popup for Email password login/signup
2. in private dashboard we will have only one page. The dashboard it self and a list of documents that we would be creating. 
3. a public share page, that we can share our docs with others

Features 
- Login will be very simple email + password ( no OTP ). In backend would use bcrypt
- dashboard page is private and cannot be accessed without login
- Share page is public, but the docs it self could be private or public 

Docs flow
- a user can create docs in dashboard
- above the list will be a button to create new docs, they can give name, manage access and set visibility as public and private. On create, the docs will have an empty string as text, and to insert data in the docs, the user has to go to its share page, and edit there ( as he is creator, he has edit access and can edit )
- the share page will act as edit page. all the given permission users can edit ( using a toggle in the top ). And if the docs is public, still only access members can edit but the whole world can see the view of it
- We can give access directly to a Email directly, it will not send an invite, direct added and given access. No notifications for now

Stack
frontend, use Next.js typescript, HeroUI components, Zod validations, axios, corrrect file and folder structure, use tailwind
backend , use express.js typescript, mongoDB, Zod, bcrypt, halmet, rate limiter, correct file and folder structure, bearer jwt token for access middle ware checks. folder structure will have routes, view, middleware, helper thats it
For docs view and edit stuff, we would be using @eigenpal/docx-editor-react. A very simple frontend edit and view only, no live or server stuff.
The usage
`
import { DocxEditor } from '@eigenpal/docx-editor-react';
import '@eigenpal/docx-editor-react/styles.css';

function MySimpleEditor({ fileBuffer }) {
  return (
    <DocxEditor 
      documentBuffer={fileBuffer} 
      // mode="viewing" // Uncomment this if you want it to act as a viewer only
      onSave={(updatedBuffer) => {
        // Handle saving locally or upload to your database
        console.log("Document saved!", updatedBuffer);
      }} 
    />
  );
}
`

the two backend collections to be made
user
`
email
password
createdAt
updatedAt
( add something if i missed )
`
doc
`
user ( the creator )
access ( users having view or edit access ) = {user: direct monogdb Id, email: the email of user, access: edit/view}
doc ( the doc text and stuff )
visibility ( public or private ) ( if public, everyone can see, but user with edit access can edit, if private edit access can edit, and view access can only view
createdAt
updatedAt
( add something if i missed )
`
Rules
- all routes if required must be validated with Zod and access permissions
- separate components must be made for reuseability.
- Must use global css variables for colors and text etc
- The plan must be divided in multiple steps

After planning all of the above, use an agent to create a design token, so all website use that same design token for designing the frontend. use this workflow ".claude\workflows\teach\helpers\teach-impeccable.md" this will create a new design token to follow

