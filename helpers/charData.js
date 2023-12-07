const Order=require('../models/orderModel')


// const getDailyDataArray=async()=>{

//     const currentDate=new Date();
//     const sevendaysAgo=new Date(currentDate);
//     sevendaysAgo.setDate(currentDate.getDate()-7);

//     const dailyOrders=await Order.aggregate([
//         {
//             $match:{
//                 status:"Payment Successfull",
//                 orderDate:{$gte:sevendaysAgo, $lte : currentDate}

//             }
//         },
//         {
//             $group:{
//                 _id:{$dayOfWeek :'$orderDate'},
//                 count :{$sum:1}
//             }
//         },
//         {
//             $sort:{'_id':1}
//         }
//     ]);

//     const  dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
//     const dailyDataArray=[];
//     for(let i=6;i>=0;i--){
//         const dayIndex=new Date(currentDate);
//         dayIndex.setDate(currentDate.getDate()-i);
//         const foundDay=dailyOrders.find(order=>order._id===(dayIndex.getDay()=== 0 ? 7 : dayIndex.getDay()));
//         count =foundDay =dailyOrders.find(order=>order._id===(dayIndex.getDay()=== 0 ? 7 :dayIndex.getDay()))
//         const dayNameIndex=dayIndex.getIndex.getDay()=== 0 ? 6 : dayIndex.getDay() -1;
//         const dayName=dayNames[dayNameIndex];
//         dailyDataArray.push({day:dayName,count});


//     }
//     return dailyDataArray


// }



const getDailyDataArray = async () => {
    
    const currentDate = new Date(); 
    const sevenDaysAgo = new Date(currentDate); 
    sevenDaysAgo.setDate(currentDate.getDate() - 7); 
    
    const dailyOrders = await Order.aggregate([
      {
        $match: {
           status:"Payment Successful",
          orderDate: { $gte: sevenDaysAgo, $lte: currentDate } 
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$orderDate' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 } 
      }
    ]);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const dailyDataArray = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = new Date(currentDate);
      dayIndex.setDate(currentDate.getDate() - i); 
      const foundDay = dailyOrders.find(order => order._id === (dayIndex.getDay() === 0 ? 7 : dayIndex.getDay())); 
      const count = foundDay ? foundDay.count : 0; 
      const dayNameIndex = dayIndex.getDay() === 0 ? 6 : dayIndex.getDay() - 1; 
      const dayName = dayNames[dayNameIndex]; 
      dailyDataArray.push({ day: dayName, count }); 
    }
    
    
    return dailyDataArray;
    
    }

const getMonthlyDataArray=async()=>{
    const currentDate=new Date();
    const sevenMonthsAgo=new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth()-7);
    const monthlyOrders=await Order.aggregate([
        {
            $match:{
                status:"Payment Successfull",
                orderDate:{$gte:sevenMonthsAgo,$lte:currentDate}
            }
        },
        {
            $group:{
                _id:{$month : '$orderDate'},
                count:{$sum:1}
            }
        },
        {
            $sort:{'_id':1}

        }
    ]);

    const monthNames=['January','February','March','April','May','June','July','Augest','September','October','November','December']

    const monthlyDateArray=[];
    for(let i=6;i>=0;i--){
        const monthIndex=(currentDate.getMonth()-i + 12) % 12;
        const foundMonth=monthlyOrders.find(order => order._id===(monthIndex + 1));
        count =foundMonth ? foundMonth.count : 0;
        const monthName=monthNames[monthIndex];
        monthlyDateArray.push({month:monthName,count});

    }
    return monthlyDateArray;
};


const getYearlyDataArray=async()=>{

    const currentDate=new Date();
    const sevenYearsAgo=new Date(currentDate);
    sevenYearsAgo.setFullYear(currentDate.getFullYear()-7);

const yearlyOrders=await Order.aggregate([
    {
        $match:{
            status:"payment Successfull",
            orderDate:{$gte:sevenYearsAgo,$lte:currentDate}
        }
    },
    {
        $group:{
            _id:{$year : '$orderDate'},
            count:{$sum:1}
        }
    },
    {
        $sort:{'_id':1}
    }
    
]);


    const yearlyDataArray = [];
    for(let i=6;i>=0;i--){
        const year =currentDate.getFullYear()-i;

        const foundYear=yearlyOrders.find(order => order._id=== year);
        const count =foundYear ? foundYear.count : 0;
        yearlyDataArray.push({ year, count });


    }

    return yearlyDataArray;


};

module.exports={
    getMonthlyDataArray,getDailyDataArray,getYearlyDataArray
};