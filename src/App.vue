<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row flex-nowrap">
        <b-card
          img-src="https://picsum.photos/600/300/?image=25"
          img-alt="Image"
          img-top
          tag="article"
          class="ri-sideMenu"
        >
          <div class="ri-sideMenu_search">
            <h1 class="ri-sideMenu_search_title">
              口罩地圖
            </h1>
            <b-form>
              <b-form-group id="input-group-3" label="城市:" label-for="input-city">
                <!-- <b-form-select
                  id="input-city"
                  v-model="form.city"
                  :options="cityArray"
                  required
                  @change="removeMark();updateMap()"  //監聽改變
                /> -->
                <b-form-select
                  id="input-city"
                  v-model="form.city"
                  :options="cityArray"
                  required
                  @change="removeMark();updateMap()"
                />
              </b-form-group>
              <b-form-group id="input-group-3" label="區域:" label-for="input-city" class="mb-0">
                <b-form-select
                  id="input-city"
                  v-model="form.area"
                  :options="areaArray"
                  required
                  @change="updateAreaMap()"
                />
              </b-form-group>
            </b-form>
          </div>
          <ul class="ri-sideMenu_list">
            <li v-for="listItem in List" :key="listItem.properties.id">
              <h2 class="ri-sideMenu_list_title">{{ listItem.properties.name }}</h2>
              <p class="ri-sideMenu_list_note">{{ listItem.properties.note }}</p>
              <p class="ri-sideMenu_list_address">
                <span>地址: </span>{{ listItem.properties.address }}
              </p>
              <p class="ri-sideMenu_list_openTime">
                <span>營業時間:</span>{{ listItem.properties.available }}
              </p>
              <p class="ri-sideMenu_list_phone">
                <span>電話: </span>{{ listItem.properties.phone }}
              </p>
            </li>
          </ul>
        </b-card>
        <div id="mapid"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import TWcity from '@/assets/TWcity.json'
import axios from 'axios'
import { BCard, BForm, BFormGroup, BFormSelect } from 'bootstrap-vue'

console.log(L)

let openStreetMap = {};

export default {
  name: 'App',
  components: { BCard, BForm, BFormGroup, BFormSelect },
  data () {
    return {
      form: {
        city: null,
        area: null
      },
      cityArray: [{ text: '請選擇城市', value: null }],
      areaArray: [{ text: '請選擇區域', value: null }],
      show: true,
      openStreetMap: {},
      Pharmacy: [],
      PharmacyCity: [],
      List: []
    }
  },
  mounted() {
    // Step1 添加下拉選單的城市
    // TWcity.forEach((cityItem) => { this.cityArray = [...this.cityArray, { text: cityItem.CityName, value: cityItem.CityEngName }] })
    TWcity.forEach((cityItem) => { this.cityArray.push({ text: cityItem.CityName, value: cityItem.CityName }) })

    // Step2 載入藥局
    const api = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
    axios.get(api).then((response) => {
      this.Pharmacy = response.data.features
    })

    // Step3 產生地圖位置
    openStreetMap = L.map('mapid', {
      center: [25.042474, 121.513729],
      zoom: 17,
    })
    // Step3 載入底圖的地圖
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
    }).addTo(openStreetMap)

    // Step3 添加圖標
    // L.marker([25.042474, 121.513729]).addTo(openStreetMap)
  },
  watch: {
    // Step1  添加區域
    'form.city' () {
      // console.log(this.form.city)
      // const areaChose = TWcity.filter(cityItem => cityItem.CityName === this.form.city) // 會找多個
      const areaChose = TWcity.find(cityItem => cityItem.CityName === this.form.city) // 只會找一個
      this.form.area = null // 重設
      this.areaArray = [{ text: '請選擇區域', value: null }] // 重設
      // areaChose[0].AreaList.forEach((areaItem) => { this.areaArray = [...this.areaArray, { text: areaItem.AreaName, value: areaItem.AreaEngName }] })
      // areaChose[0].AreaList.forEach((areaItem) => { this.areaArray.push({ text: areaItem.AreaName, value: areaItem.AreaName }) }) // 會找多個
      areaChose.AreaList.forEach((areaItem) => { this.areaArray.push({ text: areaItem.AreaName, value: areaItem.AreaName }) }) // 只會找一個
      // this.removeMark()
      // this.updateMap()
    }
  },
  methods:{
    // Step1 +Step3 換區域時更新圖資
    updateMap () {
      // 取臺北市
      const pharmacies = this.Pharmacy.filter( pharmacyItem => pharmacyItem.properties.county == this.form.city)
      console.log('updateMap', pharmacies)
      this.PharmacyCity = pharmacies
      

      const greenIcon = L.icon({
          iconUrl: '/marker-02.png',
          iconSize:     [38, 50],
          iconAnchor:   [25,60],
          popupAnchor:  [0, -76]
      })
      // 添加圖標
      pharmacies.forEach((pharmacyItem)=>{
        const { properties, geometry } =pharmacyItem // 可以用解構的方式比較不會那麼長
        L.marker([ 
          // pharmacyItem.geometry.coordinates[1],
          // pharmacyItem.geometry.coordinates[0]
          geometry.coordinates[1],
          geometry.coordinates[0]
        ],{
          icon: greenIcon
        }).addTo(openStreetMap)
        .bindPopup(`
          <div class="ri-popup">
            <div class="ri-popup_title">藥局名稱: ${ properties.name }</div>
            <div class="ri-popup_note">${ properties.note }</div>
            <div class="ri-popup_address">
              <span>地址: </span>
              ${ properties.address }
            </div>
            <div class="ri-popup_openTime">
              <span>營業時間: </span>
              ${ properties.available }
            </div>
            <div class="ri-popup_phone">
              <span>電話: </span>
              ${ properties.phone }
            </div>
          </div>`
        ) // 點他會有文字內容
      })

      // 更新圖資位置(用取得的第一個藥局)
      this.moveTo(pharmacies[0])
    },
    updateAreaMap () {
      const pharmacies = this.PharmacyCity.filter( pharmacyItem => pharmacyItem.properties.town == this.form.area)
      console.log('updateArea', pharmacies)
      this.List = pharmacies

      // 更新圖資位置(用取得的第一個藥局)
      this.moveTo(pharmacies[0])
    },
    // Step1 +Step3 換區域時清除圖資
    removeMark () {
      // 跑所有圖層
      openStreetMap.eachLayer((layer)=>{
        if(layer instanceof L.Marker){
          openStreetMap.removeLayer(layer)
        }
      })
    },
    // Step1 +Step3 移動圖表
    moveTo ( pharmacy ) {
      const { properties, geometry } = pharmacy
      console.log('moveTo', properties)
      openStreetMap.panTo([
        geometry.coordinates[1],
        geometry.coordinates[0]
      ])
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/sass/all.scss';

// *{
//   outline: 1px solid red;
// }
.card-body{
  padding: 0px;
}
#mapid {
  width: 100%;
}

.ri-sideMenu{
  width: 400px;
  height: 100vh;
}
.ri-sideMenu_search{
  padding: 20px 10px 20px;
  margin-bottom: 5px;
  .ri-sideMenu_search_title{
    font-size: 24px;
  }
}

.ri-sideMenu_list{
  height: calc(100vh - 365px);
  overflow-y: auto;
  padding: 10px;
  background-color: #ffffff;
  list-style: none;
  li{
    background-color: #DFEAEC;
    box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
    margin-bottom: 20px;
    padding: 10px;
    overflow: hidden;
    border-radius: 10px;
  }
  .ri-sideMenu_list_title{
    font-weight: 500;
    font-size: 18px;
  }
  .ri-sideMenu_list_note{
    font-weight: 400;
    font-size: 15px;
    margin-bottom: 10px;
  }
  .ri-sideMenu_list_address,.ri-sideMenu_list_openTime,.ri-sideMenu_list_phone{
    font-weight: 300;
    font-size: 14px;
    color: rgb(75, 74, 74);
    margin-bottom: 5px;
    span{
      display: block;
      font-weight: 400;
      color: #222;
    }
  }
}

.ri-popup{
  font-family:  'Noto Sans TC',  "Segoe UI", Roboto, "Helvetica Neue", Arial;
  .ri-popup_title{
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .ri-popup_note{
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 10px;
  }
  .ri-popup_address,.ri-popup_openTime,.ri-popup_phone{
    font-weight: 300;
    font-size: 12px;
    color: rgb(75, 74, 74);
    margin-bottom: 5px;
    span{
      font-weight: 400;
      color: #222;
    }
  }
}
</style>
