import {
    IconBook,
    IconCalendarEvent,
    IconCompass,
    IconHeadset,
    IconHeart,
    IconHelp,
    IconLayoutDashboard,
    IconQuestionMark,
    IconSchool,
    IconTrophy,
    IconUsers,
    IconUsersGroup,
} from "@tabler/icons-react";
import ServiceList from "./layouts/dashboardPage";

export const mockdataRoutes = [
    // {
    //     label: "Dashboard",
    //     icon: "",
    //     initiallyOpened: true,
    //     link: "/",
    //     element: <Dashboard />,
    // },
    // {
    //     label: "Dashboard",
    //     icon: "",
    //     links: [
    //         {
    //             label: "Master",
    //             link: "/master",
    //             element: "",
    //         },
    //     ],
    // },
    {
        title: "General",
        links: [
            {
                label: "List Service",
                icon: <IconCompass />,
                link: "/explore",
                element: <ServiceList />,
            }
        ],
    }
];
